import ordermodel from "../../../db/models/order.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import productmodel from "../../../db/models/product.model.js";
import cartmodel from "../../../db/models/cart.model.js";
import couponmodel from "../../../db/models/coupon.model.js";
import { createInvoice } from "../../utils/pdf.js";
import { sendEmail } from "../../service/sendEmail.js";

//******************************************createorder**********************************/
/*
1-rayha a3ml order ll hagat el fl cart ya el cart kolha 
2-ya 23ml order l product mo3yn bl quantity bt3to fa lazem a check aleh 
3-ha check ala eh bl tarteb (coupon w ba3den el product)
-law ana hastkhdm coupon a check ala coupon el awel wala ala el product el awel 
- hat check ala el coupon el awel ashan ma3mlsh check ala product w law el coupon expired hakon amlt check ala fady 
  msh hat check ala coupon ghear law enta mdkhl coupon 

*/

export const createorder = asyncHnadler(async (req, res, next) => {
  const { productId, quantity, couponcode, address, phone, paymentMethod } =
    req.body;
  if (couponcode) {
    const coupon = await couponmodel.findOne({
      //code msh mawgod w msh fl usedby
      code: couponcode.toLowerCase(),
      usedBy: { $nin: [req.user._id] },
    });
    // console.log("Searching for coupon with code:", couponcode.toLowerCase());
    // console.log("UsedBy field:", req.user._id);

    if (!coupon || coupon.toDate < Date.now()) {
      return next(new AppError("Coupon does not exist or has expired", 404));
    }
    //req.body da object hahot feh el coupon
    req.body.coupon = coupon;
  }

  let products = [];
  let flag = false;
  //law ana ayza a3ml order l product mo3yn
  if (productId) {
    products = [{ productId, quantity }]; //khaletha array of obj kdaa ashan products andy array of objects
  } else {
    const cart = await cartmodel.findOne({ user: req.user._id });
    if (!cart.products.length) {
      return next(new AppError("cart is empty", 409));
    }
    products = cart.products; //products de rag3a mn db ya3ny mn type BSON ya3ny mayf3sh a3dl aleh
    flag = true;
  }
  let finalproducts = [];
  let subPrice = 0;
  for (let product of products) {
    const checkproduct = await productmodel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!checkproduct) {
      return next(new AppError("prooduct not exist", 409));
    }
    if (flag) {
      product = product.toObject(); //haweltha obj ashan hya gaya mn db w mayf3sh a3dl aleha
    }
    product.title = checkproduct.title;
    product.price = checkproduct.price;
    product.finalprice = checkproduct.subPrice * product.quantity;
    subPrice += product.finalprice;
    finalproducts.push(product);
  }
  const order = await ordermodel.create({
    user: req.user._id,
    products: finalproducts,
    subPrice,
    couponId: req.body?.coupon?._id,
    totalprice: subPrice - subPrice * ((req.body.coupon?.amount || 0) / 100),
    phone,
    paymentMethod,
    address,
    status: paymentMethod == "cash" ? "placed" : "waitPayment",
  });
  if (req.body?.coupon) {
    await couponmodel.updateOne(
      { _id: req.body.coupon._id },
      { $push: { usedBy: req.user._id } }
    );
  }
  for (const product of finalproducts) {
    await productmodel.findByIdAndUpdate(
      { _id: product.productId },
      { $inc: { stock: -product.quantity } }
    );
  }
  if (flag) {
    await cartmodel.updateOne({ user: req.user._id }, { products: [] });
  }
  const invoice = {
    shipping: {
      name: req.user.name,
      address: req.user.email,
      city: "Egypt",
      state: "Cairo",
      country: "EG",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: subPrice,
    paid: order.totalprice,
    invoice_nr: order._id,
    date: order.createdAt,
    coupon: req.body?.coupon?.amount || 0,
  };

  await createInvoice(invoice, "invoice.pdf");
  await sendEmail(
    req.user.email,
    "order placed",
    ` Your order has been placed successfully`,
    [
      {
        path: "invoice.pdf",
        contentType: "application/pdf",
      },
      {
        path: "logo2.jpg",
        contentType: "image/jpg",
      },
    ]
  );

  res.status(201).json({ msg: "done", order });
});

export const cancelorder = asyncHnadler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  const order = await ordermodel.findOne({ _id: id, user: req.user._id });
  if (!order) return next(new AppError("order not found", 404));
  if (
    (order.paymentMethod === "cash" && order.status != "placed") ||
    (order.paymentMethod === "card" && order.status != "withPayment")
  ) {
    return next(new AppError("you can not cancel this order :( ", 400));
  }
  await ordermodel.updateOne(
    { _id: id },
    {
      status: "cancelled",
      reason,
      cancelledBy: req.user._id,
    }
  );
  if (order?.couponId) {
    await couponmodel.updateOne(
      { _id: order?.couponId },
      {
        $pull: { usedBy: req.user._id },
      }
    );
  }
  for (const product of order.products) {
    await productmodel.updateOne(
      { _id: product.productId },
      {
        $inc: { stock: product.quantity },
      }
    );
  }
  res.status(201).json({ msg: "done" });
});

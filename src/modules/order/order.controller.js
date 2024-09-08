import ordermodel from "../../../db/models/order.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import productmodel from "../../../db/models/product.model.js";
import cartmodel from "../../../db/models/cart.model.js";
import couponmodel from "../../../db/models/coupon.model.js";
import { createInvoice } from "../../utils/pdf.js";
import { sendEmail } from "../../service/sendEmail.js";
import { payment } from "../../utils/payment.js";
import Stripe from "stripe";

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
  // const invoice = {
  //   shipping: {
  //     name: req.user.name,
  //     address: req.user.email,
  //     city: "Egypt",
  //     state: "Cairo",
  //     country: "EG",
  //     postal_code: 94111,
  //   },
  //   items: order.products,
  //   subtotal: subPrice,
  //   paid: order.totalprice,
  //   invoice_nr: order._id,
  //   date: order.createdAt,
  //   coupon: req.body?.coupon?.amount || 0,
  // };

  // await createInvoice(invoice, "invoice.pdf");
  // await sendEmail(
  //   req.user.email,
  //   "order placed",
  //   ` Your order has been placed successfully`,
  //   [
  //     {
  //       path: "invoice.pdf",
  //       contentType: "application/pdf",
  //     },
  //     {
  //       path: "logo2.jpg",
  //       contentType: "image/jpg",
  //     },
  //   ]
  // );
 if(paymentMethod=="card"){
   const stripe = new Stripe(process.env.stripe_secret)
  if(req.body?.coupon){
    const coupon =await stripe.coupons.create({
      percent_off:req.body.coupon.amount,
      duration:"once",
    })
    req.body.couponId=coupon.id

  }
   const session = await payment({
      stripe,
     payment_method_types: ["card"],
     mode: "payment",
     customer_email: req.user.email,
     metadata: {
       orderId: order._id.toString(),
     },
     success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,

     cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
     line_items: order.products.map((product) => {
       return {
         price_data: {
           currency: "egp",
           product_data: {
             name: product.title,
           },
           unit_amount: product.price * 100,
         },
         quantity: product.quantity,
       }
     }),
     discounts:req.body?.coupon?[{coupon: req.body.couponId}]:[]
    })
   
  res.status(201).json({ msg: "done", url: session.url });

 }
   res.status(201).json({ msg: "done", order});

});

//********************webhook*********** */
export const webhook=asyncHnadler(async(req,res,next)=>{
     const stripe = new Stripe(process.env.stripe_secret)
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.endpointSecret
      );
    } catch (error) {
      res.status(400).send({ error: "Webhook signature is invalid" });
      return;
    }
    //handle the event
    if(event.type!==  'checkout.session.complete'){
      const{orderId}=event.data.object.metadata
      await ordermodel.findOneAndUpdate({_id:orderId},{status:"rejected"})
      res.status(400).json({ msg: "fail" });
    }
      await ordermodel.findOneAndUpdate(
        { _id: orderId },
        { status: "placed" }
      );
      res.status(200).json({ msg: "done" });
      
})

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

import { nanoid } from "nanoid";
import cartmodel from "../../../db/models/cart.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import productmodel from "../../../db/models/product.model.js";

//******************************************createcart**********************************/
export const createcart = asyncHnadler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await productmodel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!product) {
    return next(new AppError("prosuct not exist", 409));
  }
  const cartExist = await cartmodel.findOne({
    user: req.user._id,
  });
  if (!cartExist) {
    const cart = await cartmodel.create({
      user: req.user._id,
      products: [
        {
          productId,
          quantity,
        },
      ],
    });
    res.status(201).json({ message: "cart created successfully", cart });
  }
  let flag = false;
  for (const product of cartExist.products) {
    if (productId == product.productId) {
      product.quantity = quantity;
      flag = true;
    }
  }
  if (!flag) {
    cartExist.products.push({
      productId,
      quantity,
    });
  }
  await cartExist.save();

  res.status(201).json({ message: "done", cart: cartExist });
});

export const removeecart = asyncHnadler(async (req, res, next) => {
  const { productId } = req.body;
  const cartExist = await cartmodel.findOneAndUpdate(
    //law andy arrayof obj w ayza awsl l haga gowa mn ghear loop hahotha f ""
    { user: req.user._id, "products.productId": productId },
    {
      $pull: {
        products: { productId },
      },
    },
    { new: true }
  );

  await cartExist.save();

  res.status(201).json({ message: "done", cart: cartExist });
});

export const clearcart = asyncHnadler(async (req, res, next) => {
  const cartExist = await cartmodel.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },

    { new: true }
  );
  if (!cartExist) {
    return next(new AppError("cart not exist"));
  }

  await cartExist.save();

  res.status(201).json({ message: "done", cart: cartExist });
});

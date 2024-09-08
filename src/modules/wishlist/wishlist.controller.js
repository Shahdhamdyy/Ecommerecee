import productmodel from "../../../db/models/product.model.js";
import wishlistmodel from "../../../db/models/wishlist.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";

export const createwishlist = asyncHnadler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productmodel.findById({ _id: productId });
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  const wishlist = await wishlistmodel.findOne({ user: req.user._id });
  if (!wishlist) {
    const newwishlist = await wishlistmodel.create({
      user: req.user._id,
      products: [productId],
    });
    return res
      .status(201)
      .json({ message: "Wishlist created successfully", newwishlist });
  }
  await wishlistmodel.findOneAndUpdate(
    { user: req.user._id },
    {
      //addtoset law la2et el value bt overwrite aleh msh zy push law la2tha hat push nafs el value tany bardo
      $addToSet: { products: productId },
    },
    { new: true }
  );
  res
    .status(201)
    .json({ message: "product added to Wishlist successfully", wishlist });
});

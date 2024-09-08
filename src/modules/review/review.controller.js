import ordermodel from "../../../db/models/order.model.js";
import productmodel from "../../../db/models/product.model.js";
import reviewmodel from "../../../db/models/review.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";

//******************************************createreview**********************************/
export const createreview = asyncHnadler(async (req, res, next) => {
  const { comment, rate } = req.body;
  const { productId } = req.params;
  //check product w ba3den 3aml review abl kda wla la w ba3den law klo mazbot ha create review
  //check if product exist
  const product = await productmodel.findById(productId);
  if (!product) {
    return next(new AppError("product not found", 404));
  }
  //check if review exist

  // const reviewExist = await reviewmodel.findOne({
  //   createdBy: req.user._id,
  //   productId,
  // });
  // reviewExist && next(new AppError("review already exist :(", 409));

  //check if order exist
  const order = await ordermodel.findOne({
    user: req.user._id,
    "products.productId": productId,
    status: "delivered",
  });
  if (!order) {
    return next(new AppError("order not found", 404));
  }
  const review = await reviewmodel.create({
    comment,
    rate,
    productId,
    createdBy: req.user._id,
  });

  // const reviews = await reviewmodel.find({ productId });
  // let sum = 0;
  // for (const review of reviews) {
  //   sum += review.rate;
  // }
  // product.rateAvg = sum / reviews.length;
  let sum = product.rateAvg * product.rateNum;
  sum = sum + rate;
  product.rateAvg = sum / (product.rateNum + 1);
  product.rateNum += 1;
  await product.save();
  res.status(201).json({ message: "review created successfully", review });
});
export const deletereview = asyncHnadler(async (req, res, next) => {
  const { id } = req.params;
  const review = await reviewmodel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id, // Correct the typo: req.uesr should be req.user
  });
  if (!review) {
    return next(new AppError("review not found", 404));
  }
  const product = await productmodel.findById(review.productId)
  let sum = product.rateAvg * product.rateNum
  sum = sum - review.rate
  product.rateAvg = sum / (product.rateNum - 1)
  product.rateNum -= 1
  await product.save()
  res.status(201).json({ message: "review deleted successfully", review });
});

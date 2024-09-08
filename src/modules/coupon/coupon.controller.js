import couponmodel from "../../../db/models/coupon.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";

//******************************************createcoupon**********************************/
export const createcoupon = asyncHnadler(async (req, res, next) => {
  const { code, amount, fromDate, toDate } = req.body;
  const couponExist = await couponmodel.findOne({
    code: code.toLowerCase(),
  });
  couponExist && next(new AppError("coupon already exist :(", 409));

  const coupon = await couponmodel.create({
    code,
    amount,
    fromDate,
    toDate,
    createdBy: req.user._id,
  });

  res.status(201).json({ message: "coupon created successfully", coupon });
});

export const updatecoupon = asyncHnadler(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount, fromDate, toDate } = req.body;
 const coupon = await couponmodel.findByIdAndUpdate(
   id, 
   { code, amount, fromDate, toDate }, // Update the coupon fields
   { new: true } // Return the updated coupon document
 );

  !coupon && next(new AppError("coupon not exist :(", 409));

  res.status(200).json({ message: "Coupon updated successfully", coupon });
});

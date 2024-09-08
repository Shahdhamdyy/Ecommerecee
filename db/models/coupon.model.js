import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,
      maxLength: 30,
      trim: true,
      unique: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: [true, "name is required"],
      min: 1,
      max: 100,
    },
    cratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    fromDate: {
      type: Date,
      required: [true, "name is required"],
    },
    toDate: {
      type: Date,
      required: [true, "name is required"],
    },
  },
  { timestamps: true, versionKey: false }
);
const couponmodel = mongoose.model("coupon", couponSchema);
export default couponmodel;

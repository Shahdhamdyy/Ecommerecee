import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,

      trim: true,
    },
    rate: {
      type: Number,
      required: [true, "rate is required"],
      min: 1,
      max: 5,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        require: true,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);
const reviewmodel = mongoose.model("review", reviewSchema);
export default reviewmodel;

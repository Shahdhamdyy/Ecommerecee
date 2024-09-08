import mongoose from "mongoose";
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const wishlistmodel = mongoose.model("wishlist", wishlistSchema);
export default wishlistmodel;

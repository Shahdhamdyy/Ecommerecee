import mongoose, { Types } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    products: [
      {
        title: String,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        finalprice: {
          type: Number,
          required: true,
        },
      },
    ],
    subPrice: {
      type: Number,
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coupon",
    },
    totalprice: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "cash"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "cancelled",
        "rejected",
        "placed",
        "waitPayment",
        "onWay",
        "delivered",
      ],
      default: "placed",
    },
    cancelledBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);
const ordermodel = mongoose.model("order", orderSchema);
export default ordermodel;

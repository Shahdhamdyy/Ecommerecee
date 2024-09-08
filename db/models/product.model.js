import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
      unique: true,
      lowercase: true,
    },
    slug: {
      type: String,
      minLength: 3,
      maxLength: 60,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      minLength: 3,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subcategory",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    coverImages: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    customId: String,
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    discount: {
      type: Number,
      min: 1,
      default: 1,
      max: 100,
    },
    subPrice: {
      type: Number,
      default: 1,
    },
    stock: {
      type: Number,
      default: 1,
      required: true,
    },
    rateAvg: {
      type: Number,
      default: 0,
    },
    rateNum: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
);
const productmodel = mongoose.model("product", productSchema);
export default productmodel;

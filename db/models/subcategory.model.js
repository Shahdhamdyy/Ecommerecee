import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: {
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
      maxLength: 30,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    customId: String,
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
);
const subcategorymodel = mongoose.model("subcategory", subcategorySchema);
export default subcategorymodel;

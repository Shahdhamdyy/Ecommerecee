import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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
      // Change to 'createdBy' from 'cratedBy'
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    customId: String,
  },
  { timestamps: true, versionKey: false }
);
categorySchema.virtual("subcategory", {
  ref: "subcategory",
  localField: "_id",
  foreignField: "category",
});
const categorymodel = mongoose.model("category", categorySchema);
export default categorymodel;

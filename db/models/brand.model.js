import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
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
    customId: String,
  },
  { timestamps: true, versionKey: false }
);
const brandmodel = mongoose.model("brand", brandSchema);
export default brandmodel;

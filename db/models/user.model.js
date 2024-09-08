import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/systemRoles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 15,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "age is required"],
    },
    phone: [String],
    address: [String],
    confirmed: {
      type: Boolean,
      default: false,
    },
    loggedIn: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
      enum: Object.values(systemRoles),
      default: systemRoles.user,
    },
    code: String,
    passwordchangedAt: Date,
  },
  { timestamps: true, versionKey: false }
);
const usermodel = mongoose.model("user", userSchema);
export default usermodel;

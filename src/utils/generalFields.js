import Joi from "joi";
// import { ObjectId } from "mongodb"; // Assuming you use MongoDB
import mongoose from "mongoose";

// Custom validation function for ObjectId
const validationObjectId = (value, helpers) => {
  return mongoose.Types.ObjectId.isValid(value)
    ? true
    : helpers.message("invalid Id");
};

export const generalField = {
  email: Joi.string()
    .email({ tlds: { allow: ["com", "net"] } })
    .required(),

  password: Joi.string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .required(),

  rePassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),

  id: Joi.string().custom(validationObjectId).required(),

  file: Joi.object({
    size: Joi.number().positive().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required(),
  }).required(),

  headers: Joi.object({
    "cache-control": Joi.string(),
    "postman-token": Joi.string(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    host: Joi.string(),
    "user-agent": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
    token: Joi.string().required(),
  }),

};

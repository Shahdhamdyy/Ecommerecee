import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createCategory = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
  }).required(),

  file: generalField.file.required(), // Corrected to use `.required()`

  headers: generalField.headers.required(), // Corrected to use `.required()`
};
export const updateCategory = {
  body: Joi.object({
    name: Joi.string().min(3).max(30),
  }).required(),
  file: generalField.file,
  headers: generalField.headers,
};
import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createsubcategory = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    category: generalField.id.required(),
  }).required(),
  file: generalField.file.required(),
  params:Joi.object({
    categoryId:generalField.id.required(),
  }),
  headers: generalField.headers.required(),
};
export const updatesubCategory = {
  body: Joi.object({
    name: Joi.string().min(3).max(30),
  }).required(),
  file: generalField.file,
  headers: generalField.headers,
};
import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createbrand = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
  }).required(),
  file: generalField.file.required(),
  headers: generalField.headers.required(),
};

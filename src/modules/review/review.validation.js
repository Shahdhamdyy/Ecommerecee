import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createreview = {
  body: Joi.object({
    comment: Joi.string().min(3).required(),
    rate: Joi.number().min(1).max(5).required(),
  }),
  params: Joi.object({
    productId: generalField.id.required(),
  }),
  headers: generalField.headers.required(),
};
export const deletereview = {
  params: Joi.object({
    id: generalField.id.required(),
  }),
  headers: generalField.headers.required(),
};

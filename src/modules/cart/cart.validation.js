import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createcart = {
  body: Joi.object({
    productId: generalField.id.required(),
    quantity: Joi.number().integer().required(),
  }),
  headers: generalField.headers.required(),
};
export const removeecart = {
  body: Joi.object({
    productId: generalField.id.required(),
  }),
  headers: generalField.headers.required(),
};

export const clearcart = {
  headers: generalField.headers.required(),
};

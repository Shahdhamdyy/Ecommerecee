import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createorder = {
  body: Joi.object({
    productId: generalField.id,
    quantity: Joi.number().integer(),
    phone:Joi.string().required(),
    address: Joi.string().required(),
    couponcode:Joi.string().min(3),
    paymentMethod:Joi.string().valid("card","cash").required(),
  }),
  headers: generalField.headers.required(),
};


export const cancelorder = {
  body: Joi.object({
   reason:Joi.string().min(3),
  }),
  params:Joi.object({
    id: generalField.id.required(),
  }),
  headers: generalField.headers.required(),
};

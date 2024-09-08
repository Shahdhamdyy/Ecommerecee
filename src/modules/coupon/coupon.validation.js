import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createcoupon = {
  body: Joi.object({
    code: Joi.string().min(3).max(30).required(),
    amount: Joi.number().min(1).max(100).required(),
    fromDate: Joi.date().greater(Date.now()).required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
  }),
  headers: generalField.headers.required(),
};
export const updatecoupon = {
  body: Joi.object({
    code: Joi.string().min(3).max(30),
    amount: Joi.number().min(1).max(100),
    fromDate: Joi.date().greater(Date.now()),
    toDate: Joi.date().greater(Joi.ref("fromDate")),
  }),
  headers: generalField.headers.required(),
};

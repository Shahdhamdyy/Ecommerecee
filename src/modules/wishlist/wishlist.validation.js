import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createwishlist = {
  params: Joi.object({
    productId: generalField.id.required(),
  }),

  headers: generalField.headers.required(),
};

import Joi from "joi";
import { generalField } from "../../utils/generalFields.js";

export const createProduct = {
  body: Joi.object({
    title: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(10).max(100).required(),
    price: Joi.number().integer().min(1).required(),
    // image: Joi.string().uri().required(),
    stock: Joi.number().integer().min(1).required(),
    discount: Joi.number().min(1).max(100),
    brand: generalField.id.required(),
    category: generalField.id.required(),
    subcategory: generalField.id.required(),
  }),
  files: Joi.object({
    image: Joi.array().items(generalField.file.required()).required(),
    coverImages: Joi.array().items(generalField.file.required()).required(),
  }),
  headers: generalField.headers.required(),
};
export const updateproduct = {
  body: Joi.object({
    title: Joi.string().min(3).max(30),
    description: Joi.string().min(10).max(100),
    price: Joi.number().integer().min(1),
    // image: Joi.string().uri(),
    stock: Joi.number().integer().min(1),
    discount: Joi.number().min(1).max(100),
    brand: generalField.id.required(),
    category: generalField.id.required(),
    subcategory: generalField.id.required(),
  }),
  params: Joi.object({
    id: generalField.id.required(),
  }),
  files: Joi.object({
    image: Joi.array().items(generalField.file.required()),
    coverImages: Joi.array().items(generalField.file),
  }),
  headers: generalField.headers.required(),
};

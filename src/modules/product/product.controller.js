import { nanoid } from "nanoid";
import productmodel from "../../../db/models/product.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import brandmodel from "../../../db/models/brand.model.js";
import subcategorymodel from "../../../db/models/subcategory.model.js";
import categorymodel from "../../../db/models/category.model.js";
import { json } from "express";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

//******************************************createproduct**********************************/
export const createproduct = asyncHnadler(async (req, res, next) => {
  const {
    title,
    stock,
    discount,
    price,
    brand,
    subcategory,
    category,
    description,
  } = req.body;

  //check if category -brand-subcategory      exist
  const categoryExist = await categorymodel.findOne({
    _id: category,
  });
  if (!categoryExist) return next(new AppError("category not found", 404));

  const subcategoryExist = await subcategorymodel.findOne({
    // momken ydeny id subcategory mawgoda fe3lan fa y3deh bas momken el subcategory de matkonsh bta3t el category de fa lazem a check enha bt3tha
    _id: subcategory,
    category,
  });
  if (!subcategoryExist)
    return next(new AppError("subcategory not found", 404));

  const brandExist = await brandmodel.findOne({
    _id: brand,
  });
  if (!brandExist) return next(new AppError("brand not found", 404));

  const productExist = await productmodel.findOne({
    title: title.toLowerCase(),
  });

  if (productExist) return next(new AppError("product already exists", 404));

  const subPrice = price - (price * (discount || 0)) / 100;

  if (!req.files) {
    return next(new AppError("Please upload a product image", 400));
  }
  const customId = nanoid(5);
  let list = [];
  for (const iterator of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      iterator.path,
      {
        folder: `Ecommerce/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${customId}/coverImages`,
      }
    );
    list.push({ secure_url, public_id });
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${customId}/mainImage`,
    }
  ); //hawsl ll obj el howa hatah fl routes el feh image w maxcount
  const product = await productmodel.create({
    title,
    slug: slugify(title, {
      lower: true,
      replacement: "_",
    }),
    image: { secure_url, public_id },
    coverImages: list,
    customId,
    stock,
    discount,
    subPrice,
    price,
    brand,
    subcategory,
    category,
    description,
    createdBy: req.user._id,
  });
  res.status(201).json({ message: "product created successfully", product });
});

export const getproduct = asyncHnadler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(productmodel.find(), req.query)
    .sort()
    .pagination()
    .filter()
    .search();
  const products = await apiFeatures.mongooseQuery
    .status(200)
    .json({ msg: "done",page:apiFeatures.page, products });
});

export const updateproduct = asyncHnadler(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    stock,
    discount,
    price,
    brand,
    subcategory,
    category,
    description,
  } = req.body;

  //check if category -brand-subcategory      exist
  const categoryExist = await categorymodel.findOne({
    _id: category,
  });
  if (!categoryExist) return next(new AppError("category not found", 404));

  const subcategoryExist = await subcategorymodel.findOne({
    // momken ydeny id subcategory mawgoda fe3lan fa y3deh bas momken el subcategory de matkonsh bta3t el category de fa lazem a check enha bt3tha
    _id: subcategory,
    category,
  });
  if (!subcategoryExist)
    return next(new AppError("subcategory not found", 404));

  const brandExist = await brandmodel.findOne({
    _id: brand,
  });
  if (!brandExist) return next(new AppError("brand not found", 404));
  console.log("User ID:", req.user._id);
  console.log("Product ID:", id);

  const product = await productmodel.findOne({
    _id: id,
    createdBy: req.user._id,
  });

  if (!product) return next(new AppError("product not exists", 404));

  if (title) {
    if (title.toLowerCase() == product.title) {
      return res.status(200).json({ msg: "title is the same" });
    }
    if (await productmodel.findOne({ title: title.toLowerCase() })) {
      return res.status(200).json({ msg: "title is already taken" });
    }
    product.title = title.toLowerCase();
    product.slug = slugify(title, {
      lower: true,
      replacement: "_",
    });
  }
  if (description) {
    product.description = description;
  }
  if (stock) {
    product.stock = stock;
  }

  if (price & discount) {
    product.subPrice = price - (price * (discount || 0)) / 100;
    product.price = price;
    product.discount = discount;
  } else if (price) {
    product.subPrice = price - (price * (discount || 0)) / 100;
    product.price = price;
  } else if (discount) {
    product.subPrice = price - (price * (discount || 0)) / 100;
    product.discount = discount;
  }

  if (req.files) {
    if (req.files?.image?.length) {
      await cloudinary.uploader.destroy(product.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: `Ecommerce/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${product.customId}/mainImage`,
        }
      );
      product.image = { secure_url, public_id };
    }
    if (req.files?.coverImages?.length) {
      await cloudinary.api.delete_resources_by_prefix(
        `Ecommerce/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${customId}/coverImages`
      );
      const customId = nanoid(5);
      let list = [];
      for (const iterator of req.files.coverImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          iterator.path,
          {
            folder: `Ecommerce/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${product.customId}/coverImages`,
          }
        );
        list.push({ secure_url, public_id });
      }
      product.coverImages = list;
    }
  }
  await product.save();
  res.status(201).json({ message: "product updated successfully", product });
});

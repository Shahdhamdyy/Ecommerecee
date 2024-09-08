import { nanoid } from "nanoid";
import subcategorymodel from "../../../db/models/subcategory.model.js";
import categorymodel from "../../../db/models/category.model.js";

import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";

//******************************************createsubcategory**********************************/
export const createsubcategory = asyncHnadler(async (req, res, next) => {
  const { name } = req.body;
  const categoryExist = await categorymodel.findById(req.params.categoryId);
  if (!categoryExist) return next(new AppError("category not found", 404));

  const subcategoryExist = await subcategorymodel.findOne({
    name: name.toLowerCase(),
  });
  subcategoryExist && next(new AppError("subcategory already exist :(", 409));
  if (!req.file) {
    return next(new AppError("Please upload a image", 400));
  }
  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subcategories/${customId}`,
    }
  );
  const subcategory = await subcategorymodel.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    customId,
    category: req.params.categoryId ,
    createdBy: req.user._id,
  });
  res
    .status(201)
    .json({ message: "subcategory created successfully", subcategory });
});

//******************************************getsubcategory**********************************/
export const getsubcategory = asyncHnadler(async (req, res, next) => {
  const subcategories = await subcategorymodel.find({}).populate([
    {
      path: "category",
      select: "name -_id",
    },
    {
      path: "createdBy",
      select: "name -_id",
    },
  ]);

  res.status(201).json({ message: "subcategory:", subcategories });
});


export const updatesubCategory = asyncHnadler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;


  const subcategory = await subcategorymodel.findOne({
    _id: id,
    createdBy: req.user._id,
  });

  if (!subcategory) {
    return next(new AppError("category not found", 404));
  }

  if (name) {
    if (name.toLowerCase() === subcategory.name) {
      return next(new AppError("category name should be different", 409));
    }

    if (await subcategorymodel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("category name already exist", 409));
    }

    subcategory.name = name.toLowerCase();
    subcategory.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (!req.file) {
    return next(new AppError("Please upload a image", 400));
  }
  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/categories/${categoryExist.customId}/subcategories/${customId}`,
    }
  );
  category.image = { secure_url, public_id };

  await subcategory.save();

  res.status(201).json({ message: "category updated successfully", subcategory });
});

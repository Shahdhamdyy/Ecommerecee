import { nanoid } from "nanoid";
import categorymodel from "../../../db/models/category.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";
import usermodel from "../../../db/models/user.model.js";
import subcategorymodel from "../../../db/models/subcategory.model.js";

//******************************************createCategory**********************************/
export const createCategory = asyncHnadler(async (req, res, next) => {
  const { name } = req.body;
  const categoryExist = await categorymodel.findOne({
    name: name.toLowerCase(),
  });
  categoryExist && next(new AppError("category already exist :(", 409));

  if (!req.file) {
    return next(new AppError("Please upload a image", 400));
  }
  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    //multer hategy t pass el path bta3 sowar wkhalas mlhash lazma tany w cloudinary yakhod el path da wyrf3ha la cloudianry mn ghear el multer msh ha3rf awsl ll path asln ashan hya el btt3rf ala el data mn postman .

    req.file.path,
    {
      folder: `Ecommerce/categories/${customId}`,
    }
  );

  req.filePath = `Ecommerce/categories/${customId}`;
  const category = await categorymodel.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
  });
  req.data = {
    model: categorymodel,
    id: category._id,
  };
  return res
    .status(201)
    .json({ message: "category created successfully 🤞", category });
});

//******************************************updateCategory**********************************/
export const updateCategory = asyncHnadler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  // console.log("Category ID:", id);
  // console.log("User ID:", req.user._id);

  const category = await categorymodel.findOne({
    _id: id,
    createdBy: req.user._id,
  });

  if (!category) {
    return next(new AppError("category not found", 404));
  }

  if (name) {
    if (name.toLowerCase() === category.name) {
      return next(new AppError("category name should be different", 409));
    }

    if (await categorymodel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("category name already exist", 409));
    }

    category.name = name.toLowerCase();
    category.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  //checl ala pic
  if (req.file) {
    console.log("7");

    //line da masa7 el sora el adema
    await cloudinary.uploader.destroy(category.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        //amalataha category.customid ashan aghzn f nafs el makan w ashan custom id da variable hay3rfo mnen w howa msh hna
        folder: `Ecommerce/categories/${category.customId}`,
      }
    );
    category.image = { secure_url, public_id };
  }

  await category.save();

  res.status(201).json({ message: "category updated successfully", category });
});

export const getcategory = asyncHnadler(async (req, res, next) => {
  const categories = await categorymodel
    .find({})
    .populate([{ path: "subcategory" }]);

  res.status(201).json({ message: "subcategory:", categories });
});

export const deletecategory = asyncHnadler(async (req, res, next) => {
  const { id } = req.params;
  const category = await categorymodel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!category) {
    return next(new AppError("category not found", 404));
  }
  //delete subcategory
  await subcategorymodel.deleteMany({ category: category._id });
  //delete form cloudinary
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${category.customId}`
  );
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${category.customId}`
  );

  res.status(201).json({ message: "subcategory:" });
});

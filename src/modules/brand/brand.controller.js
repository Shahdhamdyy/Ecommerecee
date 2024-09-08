import { nanoid } from "nanoid";
import brandmodel from "../../../db/models/brand.model.js";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";

//******************************************createbrand**********************************/
export const createbrand = asyncHnadler(async (req, res, next) => {
  const { name } = req.body;
  const brandExist = await brandmodel.findOne({
    name: name.toLowerCase(),
  });
  brandExist && next(new AppError("brand already exist :(", 409));
  if (!req.file) {
    return next(new AppError("Please upload a image", 400));
  }
  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/brands/${customId}`,
    }
  );
  const brand = await brandmodel.create({
    name,
    slug: slugify(name, {
      replacement: "_",
      lower: true,
    }),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
  });
  res.status(201).json({ message: "brand created successfully", brand });
});

export const updatebrand = asyncHnadler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;


  const brand = await brandmodel.findOne({
    _id: id,
    createdBy: req.user._id,
  });

  if (!brand) {
    return next(new AppError("brand not found", 404));
  }

  if (name) {
    if (name.toLowerCase() === brand.name) {
      return next(new AppError("brand name should be different", 409));
    }

    if (await brandmodel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("brand name already exist", 409));
    }

    brand.name = name.toLowerCase();
    brand.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  //checl ala pic
  if (req.file) {
    console.log("7");

    //line da masa7 el sora el adema
    await cloudinary.uploader.destroy(brand.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        //amalataha brand.customid ashan aghzn f nafs el makan w ashan custom id da variable hay3rfo mnen w howa msh hna
        folder: `Ecommerce/brands/${brand.customId}`,
      }
    );
    brand.image = { secure_url, public_id };
  }

  await brand.save();

  res.status(201).json({ message: "brand updated successfully", brand });
});


export const deletebrand = asyncHnadler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await brandmodel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!brand) {
    return next(new AppError("brand not found", 404));
  }
  //delete subbrand
  await brandmodel.deleteMany({ brand: brand._id });
  //delete form cloudinary
  await cloudinary.api.delete_resources_by_prefix(
    `Ecommerce/categories/${brand.customId}`
  );
  await cloudinary.api.delete_folder(
    `Ecommerce/categories/${brand.customId}`
  );

  res.status(201).json({ message: "brand:" });
});

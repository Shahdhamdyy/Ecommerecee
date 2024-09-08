import { Router } from "express";
import * as cc from "./category.controller.js";
import { multerHost, validExtension } from "../../middleware/multer.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as cv from "./category.validation.js";
import { validation } from "../../middleware/validation.js";
import  subcategoryRouter  from "../subCategory/subcategory.routes.js";
import { systemRoles } from "../../utils/systemRoles.js";
const categoryRouter = Router();
categoryRouter.use("/:categoryId/subCategories",subcategoryRouter)
categoryRouter.post(
  "/create",
  multerHost(validExtension.image).single("image"),
  // validation(cv.createCategory),
  auth(["admin"]),
  cc.createCategory
);

categoryRouter.put(
  "/:id",
  multerHost(validExtension.image).single("image"),
  // validation(cv.createCategory),
  auth([systemRoles.admin]),
  cc.updateCategory
);

categoryRouter.get(
  "/",
  // ,auth(Object.values(systemRoles))
  cc.getcategory
);
categoryRouter.delete("/delete/:id", cc.deletecategory);

export default categoryRouter;

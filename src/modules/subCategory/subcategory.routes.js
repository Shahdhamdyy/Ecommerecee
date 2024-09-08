import { Router } from "express";
import * as scc from "./subcategory.controller.js";
import { multerHost, validExtension } from "../../middleware/multer.js";
import {auth} from "../../middleware/auth.js"; // Ensure auth is imported
import * as cv from "./subcategory.validation.js"
import { systemRoles } from "../../utils/systemRoles.js";
import { validation } from "../../middleware/validation.js";
const subcategoryRouter = Router({mergeParams:true});

subcategoryRouter.post(
  "/",
  multerHost(validExtension.image).single("image"),
  // validation(cv.createsubcategory),
  auth([systemRoles.admin]),
  scc.createsubcategory
);
subcategoryRouter.put(
  "/update/:id",
  multerHost(validExtension.image).single("image"),
  // validation(cv.createCategory),
  auth([systemRoles.admin]),
  scc.updatesubCategory
);

subcategoryRouter.get(
  "/",
  // auth(Object.values(systemRoles)),
  scc.getsubcategory
);
export default subcategoryRouter;

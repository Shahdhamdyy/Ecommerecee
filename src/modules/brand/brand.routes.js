import { Router } from "express";
import * as bc from "./brand.controller.js";
import { multerHost, validExtension } from "../../middleware/multer.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as cv from "./brand.validation.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";
const brandRouter = Router();

brandRouter.post(
  "/",
  multerHost(validExtension.image).single("image"),
  validation(cv.createbrand),
  auth([systemRoles.admin]),
  bc.createbrand
);brandRouter.put(
  "/:id",
  multerHost(validExtension.image).single("image"),
  // validation(cv.createCategory),
  auth([systemRoles.admin]),
  bc.updatebrand
);
brandRouter.delete("/:id", bc.deletebrand);



export default brandRouter;

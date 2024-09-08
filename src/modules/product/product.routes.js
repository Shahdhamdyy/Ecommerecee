import { Router } from "express";
import * as scc from "./product.controller.js";
import { multerHost, validExtension } from "../../middleware/multer.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as pv from "./product.validation.js";
import { systemRoles } from "../../utils/systemRoles.js";
import { validation } from "../../middleware/validation.js";
import reviewRouter from "../review/review.routes.js";
import wishlistRouter from "../wishlist/wishlist.routes.js";
const productRouter = Router({ mergeParams: true });
productRouter.use("/:productId/review", reviewRouter);
productRouter.use("/:productId/wishlist", wishlistRouter);
productRouter.post(
  "/",
  multerHost(validExtension.image).fields([
    //fiels object gowah aktr mn key
    { name: "image", maxCount: 1 }, //[{}]
    { name: "coverImages", maxCount: 3 }, //[{}{}{}] num of objects ala hasb el max-count
  ]),
  validation(pv.createProduct),
  auth([systemRoles.admin]),
  scc.createproduct
);
productRouter.put(
  "/:id",
  multerHost(validExtension.image).fields([
    //fiels object gowah aktr mn key
    { name: "image", maxCount: 1 }, //[{}]
    { name: "coverImages", maxCount: 3 }, //[{}{}{}] num of objects ala hasb el max-count
  ]),
  validation(pv.updateproduct),
  auth([systemRoles.admin]),
  scc.updateproduct
);
productRouter.get("/", scc.getproduct);
export default productRouter;

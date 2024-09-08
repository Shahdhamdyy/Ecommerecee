import { Router } from "express";
import * as bc from "./coupon.controller.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as cv from "./coupon.validation.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";
const couponRouter = Router();

couponRouter.post(
  "/",
  validation(cv.createcoupon),
  auth([systemRoles.admin]),
  bc.createcoupon
);
couponRouter.put(
  "/:id",
  validation(cv.updatecoupon),
  auth([systemRoles.admin]),
  bc.updatecoupon
);

export default couponRouter;

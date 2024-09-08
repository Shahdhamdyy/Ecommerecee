import { Router } from "express";
import * as rc from "./review.controller.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as rv from "./review.validation.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";
const reviewRouter = Router({mergeParams:true});

reviewRouter.post(
  "/",
  validation(rv.createreview),
  auth([systemRoles.admin]),
  rc.createreview
);
reviewRouter.delete(
  "/:id",
  validation(rv.deletereview),
  auth([systemRoles.admin]),
  rc.deletereview
);

export default reviewRouter;

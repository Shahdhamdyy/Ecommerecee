import express from "express";
import { validation } from "../../middleware/validation.js";
import { auth } from "../../middleware/auth.js";
import * as cv from "./wishlist.validation.js";
import * as cc from "./wishlist.controller.js";
import { systemRoles } from "../../utils/systemRoles.js";

const wishlistRouter = express.Router({ mergeParams: true });
wishlistRouter.post(
  "/",
  validation(cv.createwishlist),
  auth(Object.values.systemRoles),
  cc.createwishlist
);

export default wishlistRouter;

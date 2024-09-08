import { Router } from "express";
import * as bc from "./cart.controller.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as cv from "./cart.validation.js";
import { validation } from "../../middleware/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";
const cartRouter = Router();

cartRouter.post(
  "/",
  validation(cv.createcart),
  auth(Object.values(systemRoles)),
  bc.createcart
);
cartRouter.patch(
  "/",
  validation(cv.removeecart),
  auth(Object.values(systemRoles)),
  bc.removeecart
);

cartRouter.put(
  "/",
  validation(cv.clearcart),
  auth(Object.values(systemRoles)),
  bc.clearcart
);

export default cartRouter;

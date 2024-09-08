import { Router } from "express";
import * as bc from "./order.controller.js";
import { auth } from "../../middleware/auth.js"; // Ensure auth is imported
import * as cv from "./order.validation.js";
import { validation } from "../../middleware/validation.js";
const orderRouter = Router();

orderRouter.post(
  "/",
  validation(cv.createorder),
  auth(["admin"]),
  bc.createorder
);
orderRouter.put(
  "/:id",
  validation(cv.cancelorder),
  auth(["admin"]),
  bc.cancelorder
);


  
   
    


export default orderRouter;

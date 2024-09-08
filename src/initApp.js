import connectionDB from "../db/connectionDB.js";
import * as router from "../src/modules/index.routes.js";
import { auth } from "./middleware/auth.js";
import { globalErrorHnadler } from "./utils/asyncHandler.js";
import { AppError } from "./utils/classError.js";
import { deleteFromCloudinary } from "./utils/deleteFromCloudinary.js";
import { deleteFromDatabase } from "./utils/deleteFromDatabase.js";
import cors from "cors"
export const initApp = (app, express) => {
  app.use(cors())
  app.use((req,res,next)=>{
    if(originalUrl=="/orders/webhook"){
      next()
    }else{
      express.json()(req,res,next)
    }
  })
  app.use(express.json());
  app.get("/",(req,res)=>{
    res.status(200).json({msg:"hello from my project"})
  })
  app.use("/users", router.userRouter);
  app.use("/categories", router.categoryRouter);
  app.use("/subcategories", router.subcategoryRouter);
  app.use("/brands", router.brandRouter);
  app.use("/products", router.productRouter);
  app.use("/coupons", router.couponRouter);
  app.use("/cart", router.cartRouter);
  app.use("/orders",router.orderRouter)
  app.use("/review", router.reviewRouter);
  app.use("/wishlist",router.wishlistRouter)

  app.use("/test", auth(["admin"]));

  connectionDB();

  app.get("*", (req, res, next) => {
    return next(new AppError(`invalid url ${req.originalUrl}`));
  });

  app.use(globalErrorHnadler, deleteFromCloudinary, deleteFromDatabase);

}
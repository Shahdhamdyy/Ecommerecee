import Router  from "express";
import * as uc from "./user.controller.js";
const userRouter = Router();
userRouter.post("/signUp", uc.signUp);
userRouter.get("/verifyEmail/:token", uc.verifyEmail);
userRouter.get("/refreshToken/:rftoken", uc.refreshToken);
userRouter.patch("/forgetpassword", uc.forgetPassword);
userRouter.patch("/resetPassword", uc.resetPassword);
userRouter.post("/signin", uc.signin);

export default userRouter;

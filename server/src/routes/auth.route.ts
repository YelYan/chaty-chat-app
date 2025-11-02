import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { authStatusController, loginController, logoutController, registerController } from "../controller/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register" , registerController);
authRoutes.post("/login" , loginController);
authRoutes.post("/logout" , logoutController);
authRoutes.get("/status" , passportAuthenticateJwt , authStatusController)

export default authRoutes;
import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { getUsersController } from "../controller/user.controller.js";

const userRoutes = Router();

userRoutes.use(passportAuthenticateJwt);
userRoutes.get("/all"  , getUsersController)

export default userRoutes;
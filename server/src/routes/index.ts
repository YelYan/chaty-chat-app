import { Router } from "express";
import authRoutes from "./auth.route.js";
import chatRoutes from "./chat.route.js"
import userRoutes from "./user.route.js";

const router = Router();

router.use("/auth" , authRoutes);
router.use("/user" , userRoutes);
router.use("/chat" , chatRoutes)

export default router;
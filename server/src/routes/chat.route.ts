import { Router } from "express";
import { createChatController, getChatsController, getSingleChatController } from "../controller/chat.controller.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { sendMessageController } from "../controller/message.controller.js";

const chatRoutes = Router();

chatRoutes.use(passportAuthenticateJwt);
chatRoutes.post("/create", createChatController);
chatRoutes.get("/all" , getChatsController);
chatRoutes.get("/:id" , getSingleChatController);
chatRoutes.post("/message/send", sendMessageController)

export default chatRoutes;
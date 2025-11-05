import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { messageSchema } from "../validators/message.validator.js";
import { sendMessageService } from "../services/message.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const sendMessageController = asyncHandler(async (req : Request , res : Response) => {

    const userId = req.user?._id;
    const body = messageSchema.parse(req.body);

    const result = await sendMessageService(body , userId)

    res.status(HTTPSTATUS.CREATED).json({
        success : true,
        message : "Message sent successfully",
        ...result
    })
})

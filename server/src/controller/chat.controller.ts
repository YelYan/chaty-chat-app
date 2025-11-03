import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request , Response } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import { createChatSchema , chatIdSchema } from "../validators/chat.validator.js";
import { createChatService, getSingleChatService, getUserChatsService } from "../services/chat.service.js";
import { UnauthorizedException } from "../utils/app-error.js";

export const createChatController = asyncHandler(async (req : Request, res : Response) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new UnauthorizedException("User not authenticated");
    }

    const body = createChatSchema.parse(req.body);

    const chat = await createChatService(body , userId)

    return res.status(HTTPSTATUS.CREATED).json({
        success : true,
        message : "Chat created or retrieved successfully ",
        data: chat,
    })
})

export const getChatsController = asyncHandler(async (req : Request, res : Response) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new UnauthorizedException("User not authenticated");
    }

    const chats = await getUserChatsService(userId)

    return res.status(HTTPSTATUS.OK).json({
        success : true,
        message : "User chats retrieved successfully ",
        data: chats,
    })
})

export const getSingleChatController = asyncHandler(async (req : Request, res : Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);

    if (!userId) {
        throw new UnauthorizedException("User not authenticated");
    }

    const {chat, messages} = await getSingleChatService(id, userId)

    return res.status(HTTPSTATUS.OK).json({
        success : true,
        message : "User one on one chat retrieved successfully ",
        data: chat,
        messages
    })
})
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request , Response } from "express";
import { HTTPSTATUS } from "../config/http.config.js";
import { getUserService } from "../services/user.service.js";

export const getUsersController = asyncHandler(async (req : Request, res : Response) => {
    const userId = req.user?._id;

    const users = await getUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
        message : "Users retrieved successfully ",
        users,
    })
})
import type { ErrorRequestHandler } from "express"
import { HTTPSTATUS } from "../config/http.config.js";
import { AppError, ErrorCodes } from "../utils/app-error.js";

export const errHandler : ErrorRequestHandler =  (
    error,
    req,
    res, 
    next
) : any => {
    console.log(`Error occurred: ${req.path}` , error);


    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            message : error.message,
            errorCode : error.errorCode
        })
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message : "Internal server error",
        error : error?.message || "Something went wrong",
        errorCode : ErrorCodes.ERR_INTERNAL
    })
}
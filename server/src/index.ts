import 'dotenv/config';
import express from "express";
import passport from 'passport';
import cors from "cors"
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { Env } from "./config/env.config.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "./config/http.config.js";
import  connectDatabase  from './config/database.config.js';
import { errHandler } from './middlewares/errHandler.middleware.js';
import routes from './routes/index.js';
import "./config/passport.config.js"

const app = express();

app.use(express.json({limit : "10mb"}));
app.use(cookieParser());
app.use(express.urlencoded({extended : true}));
app.use(
    cors({
        origin : Env.FRONTEND_URL,
        credentials : true
    })
)

app.use(passport.initialize());

app.get("/health", asyncHandler(async(req : Request , res : Response) => {
    res.status(HTTPSTATUS.OK).json({
        message : "Server is healthy",
        status : "OK"
    })
}))

// api routes
app.use("/api/v1" , routes)

app.use(errHandler);

//  Server listen 
const startServer = () => {
    app.listen(Env.PORT,async () => {
        await connectDatabase();
        console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`)
    })
}
startServer();
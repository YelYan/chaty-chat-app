import { getEnv } from "../utils/get-env.js"

export const Env = {
    NODE_ENV: getEnv("NODE_ENV" , "development"),
    PORT : getEnv("PORT" ,  "9000" ),
    MONGO_URI : getEnv("MONGO_URI"),
    JWT_SECRET_KEY: getEnv("JWT_SECRET_KEY" , "secret_jwt"),
    JWT_EXPIRES_IN : getEnv("JWT_EXPIRES_IN" , "15m"),
    FRONTEND_URL : getEnv("FRONTEND_URL" , "http://localhost:5173"),
    CLOUD_NAME : getEnv("CLOUD_NAME"),
    CLOUDINARY_KEY : getEnv("CLOUDINARY_KEY"),
    CLOUDINARY_SECRET : getEnv("CLOUDINARY_SECRET")
} as const
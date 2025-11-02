import { UserDocument } from "../models/user.model.ts";

declare global {
    namespace Express {
        interface User extends Document {
            _id? : any
        }
    }
}
import UserModel from "../models/user.model.js"

export const findByIdUserService = async (userId : string) => {
    return await UserModel.findById(userId);
}
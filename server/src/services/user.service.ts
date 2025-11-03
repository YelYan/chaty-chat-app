import UserModel from "../models/user.model.js"

export const findByIdUserService = async (userId : string) => {
    return await UserModel.findById(userId);
}

export const getUserService = async (userId : string) => {
    const users = await UserModel.find(
       { _id : {$ne : userId}}  // This means "find all users where _id is NOT equal to userId"
    ).select('-password');

    return users;
}
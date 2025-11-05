import MessageModel from "../models/message.model.js";
import ChatModel from "../models/chat.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import type mongoose from "mongoose";

export const sendMessageService = async(
    body : {
        chatId? : string | undefined;
        content? : string | undefined;
        image? : string | undefined;
        replyToId? : string | undefined
    },
    userId? : string
) => {
    const {chatId , content , image , replyToId }  = body;

    const chat = await ChatModel.findOne({
        _id : chatId,
        participants : { 
            $in : [userId]
        }
    })

    if(!chat) throw new BadRequestException("Chat not found or unauthorized");

    if(replyToId) {
        const repliedMessgae = await MessageModel.findOne({
            _id : replyToId,
            chat : chatId
        })

        if(!repliedMessgae)  throw new NotFoundException("Replied message not found in this chat");
    }

    let imageUrl;

    if(image) {
        const uploadRes = await cloudinary.uploader.upload(image , {
            folder : "chat-app/messages"
        });
        imageUrl = uploadRes.secure_url;
    }

    const newMessage = await MessageModel.create({
        chatId,
        sender : userId,
        content,
        image : imageUrl,
        replyTo: replyToId|| null,
    })

    await newMessage.populate([
        {path : "sender" , select : "name avatar"},
        {
            path : "replyTo",
            select : "content image sender",
            populate : {
                path : "sender",
                select : "name avatar"
            }
        }
    ]);

    chat.lastMessage = newMessage._id  as mongoose.Types.ObjectId;
    await chat.save();
    
    return {
        userMessage : newMessage,
        chat
    }
}
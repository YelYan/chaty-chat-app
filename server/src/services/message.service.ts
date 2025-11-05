import MessageModel from "../models/message.model.js";
import ChatModel from "../models/chat.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import type mongoose from "mongoose";
import { emitLastMessageToParticipants, emitNewMessageToChatRoom } from "../lib/socket.js";


/*
Alice sends message 
→ Security check (is she in chat?)
→ Validate reply (if replying)
→ Upload image (if any)
→ Save to database
→ Populate user details
→ Update chat's last message
→ Broadcast to chat room (except Alice)
→ Update everyone's chat previews
→ Return message to Alice
*/

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

    //implement websocket

    //websocket emit the new Message to the chat room
    emitNewMessageToChatRoom(userId, chatId, newMessage);

    //websocket emit the lastmessage to members (personnal room user)
    const allParticipantIds = chat.participants.map(participantId => participantId.toString());
    emitLastMessageToParticipants(allParticipantIds , chatId,  newMessage);
    
    return {
        userMessage : newMessage,
        chat
    }
}

export const validateChatParticipantService = async(chatId : string , userId : string) => {
    const chat = await ChatModel.findOne({
        _id : chatId,
        participants : {
            $in : [userId]
        }
    });

    if(!chat) throw new BadRequestException("User not a participant of this chat");

    return chat;
}

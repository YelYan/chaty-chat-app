import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import UserModel from "../models/user.model.js";
import {  BadRequestException, NotFoundException } from "../utils/app-error.js";

export const createChatService = async (
body: {
    groupName? : string | undefined;
    isGroup? : boolean;
    participantId? : string | undefined;
    participants? : string[] | undefined
} , userId : string
) => {
    const { participantId, groupName , isGroup, participants}  = body;

    let chat;
    let allParticipantIds : string[] = [];

    if(isGroup && participants?.length && groupName) {
        allParticipantIds = [userId , ...participants];
        chat = await ChatModel.create({
            participants : allParticipantIds,
            isGroup : true, 
            groupName, 
            createdBy : userId
        })
    } else if(participantId) {
        const otherUser = await UserModel.findById(participantId);
        if(!otherUser) throw new NotFoundException("User not found");
        
        allParticipantIds = [userId , participantId];
        const existingChat = await ChatModel.findOne({
            participants : {
                $all : allParticipantIds,
                $size : 2,
            }
        }).populate("participants", "name avatar")

        if(existingChat) return existingChat;

        chat = await ChatModel.create({
            participants : allParticipantIds,
            isGroup : false,
            createdBy : userId
        })
        
    }

    //Implemant websocket

    return chat;
}

export const getUserChatsService = async (userId : string) => {
    const chats = await ChatModel.find({
        participants : {
            $in : [userId]
        }
    })
    .populate("participants", "name avatar")
    .populate({
        path : "lastMessage",
        populate : {
            path : "sender",
            select : " name avatar",
        }
    }).sort({updatedAt : -1 });

    return chats
}

export const getSingleChatService = async (chatId : string , userId : string) => {
    const chat = await ChatModel.findOne({
        _id : chatId,
        participants : {
            $in : [userId] // get all user except the current user
        }
    })
    .populate("participants", "name avatar");

    if(!chat){
        throw new BadRequestException(
            "Chat not found or you are not authorized to view this chat"
        )
    }

    const messages = await MessageModel.find({ chatId })
    .populate("sender" , "name avatar")
    .populate({
        path : "replyTo",
        select : "content image sender",
        populate : {
            path : "sender",
            select : "name avatar"
        }
    }).sort({createdAt : -1});

    return {chat , messages};
}

// export const createChatService = async (
//     body : {
//     groupName? : string | undefined;
//     isGroup? : boolean;
//     participantId? : string | undefined;
//     participants? : string[] | undefined
//     },
//     userId : string
// ) => {
//     const {participantId , isGroup , groupName , participants} = body;

//     //validate group chat requirements
//     if(isGroup) {
//         if(!participants || participants.length === 0) {
//             throw new BadRequestException("Participants are required for group chat");
//         }
//         if(!groupName) {
//             throw new BadRequestException("Group name is required for group chat");
//         }

//         // Check for duplicate group with same participants and name

//         const allParticipantIds = [userId , ...participants];
//         const existingGroupChat = await ChatModel.findOne({
//             isGroup : true,
//             groupName,
//             participants : {$all : allParticipantIds , size : allParticipantIds.length}
//         })

//         if (existingGroupChat) {
//             return { chat: existingGroupChat, wasExisting: true };
//         }

//         // if group chat is not exist create new group chat
//         const chat = await ChatModel.create({
//             participants: allParticipantIds,
//             isGroup: true,
//             groupName,
//             createdBy: userId
//         })

//         await chat.populate("participants" , "name avatar");
//         return { chat, wasExisting: false };
//     }

//     // handle one on one chat
//     if(!participantId){
//          throw new BadRequestException("Participant ID is required for one-on-one chat");
//     }

//     // Check if user is trying to chat with themselves
//     if (userId === participantId) {
//         throw new BadRequestException("Cannot create chat with yourself");
//     }

//     const otherUser = await UserModel.findById(participantId);
//     if(!otherUser) {
//         throw new NotFoundException("User not found");
//     }

//     const allParticipantIds = [userId , participantId];
//     const existingOneonOneChat = await ChatModel.findOne({
//         participants : {$all : allParticipantIds , size : 2},
//         isGroup : false,
//     }).populate("participants", "name avatar");

//     if(existingOneonOneChat) {
//         return {chat : existingOneonOneChat , wasExisting : true}
//     }

//     const chat = await ChatModel.create({
//         participants: allParticipantIds,
//         isGroup: false,
//         createdBy: userId
//     });
//     await chat.populate("participants", "name avatar");
//     return { chat, wasExisting: false };
// }
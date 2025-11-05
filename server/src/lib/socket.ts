import { Server as HTTPServer } from "http";
import jwt  from "jsonwebtoken";
import  type { JwtPayload } from "jsonwebtoken";
import { Server, type Socket } from "socket.io";
import { Env } from "../config/env.config.js";
import { validateChatParticipantService } from "../services/message.service.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSocket = (httpServer : HTTPServer)  => {
    io = new Server(httpServer, {
        cors : {
            origin : Env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        connectionStateRecovery: {
            // Enable reconnection support
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        }
    });

    io.use(async (socket : AuthenticatedSocket , next) => {
        // Middleware for authentication

        try {
            const rawCookie = socket.handshake.headers.cookie;
            if (!rawCookie) {
                return next(new Error("Unauthorized"));
            }

            const token = rawCookie?.split("=")?.[1]?.trim();
            if(!token) return next(new Error("Malformed authentication token"));

            const decodedToken = jwt.verify(token as string, Env.JWT_SECRET_KEY ) as { userId: string };
            if (!decodedToken) return next(new Error("Unauthorized"));
            socket.userId = decodedToken.userId;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                next(new Error("Token expired"));
            } else if (error instanceof jwt.JsonWebTokenError) {
                next(new Error("Invalid token"));
            } else {
                console.error("Auth error:", error);
                next(new Error("Authentication failed"));
            }
        }
    })

    io.on("connection", (socket : AuthenticatedSocket) => {
        if(!socket.userId) {
            socket.disconnect(true);
            return;
        }
        const userId = socket.userId!;
        const previousSocketId = onlineUsers.get(userId);
        const newSocketId = socket.id;

        console.log("socket connected: ", newSocketId , " for user: ", userId);
        
       // When user connects: add/update their socket ID // Add to online list
        onlineUsers.set(userId, newSocketId);

        // Notify about connection (handle reconnections gracefully)
        if (previousSocketId) {
            console.log(`User ${userId} reconnected`);
        }

        // Tell EVERYONE about updated online users
        io?.emit("online:users", Array.from(onlineUsers.keys()));

        // create personal room for for private messages
        socket.join(`user:${userId}`);


        // join the chat room
        socket.on("chat:join", async (
            chatId : string, callback? : (error? : string) => void
        ) => {
            try {
                 // Security check: Is user actually in this chat?
                await validateChatParticipantService(chatId , userId);
                socket.join(`chat:${chatId}`);// Join the room
                callback?.();
            } catch (error) {
                callback && callback("Failed to join chat room");
            }
        });

        // leave the chat room
        socket.on("chat:leave", async (
            chatId : string, 
        ) => {
            if(chatId) {
                socket.leave(`chat:${chatId}`);
                console.log(`User ${userId} left room chat:${chatId}`);
            }
        })

        // disconnect 
        socket.on("disconnect" , () => {
            // Only remove if this is her most recent connection
            if(onlineUsers.get(userId) === newSocketId) {
                if (userId) onlineUsers.delete(userId);
            }

            // Update everyone's online list
            io?.emit("online:users", Array.from(onlineUsers.keys()));
            console.log("socket disconnected", {
            userId,
            newSocketId,
            });
        })
    })
}

export const getIO = () => {
    if(!io) throw new Error("Socket.io not initialized");
    return io;
}

/**
 * Real-life example:
 *
 * Alice creates a family group chat with Bob and Carol
 *
 * This function sends "New chat!" notifications to Bob and Carol's phones
 * 
 */

export const emitNewChatToParticipants = (participantIdStrings : string[] = [], chat : any) => {
    const io = getIO()
    //  Sends a real-time notification to each participant that a new chat was created.
    for(const participantId of participantIdStrings) {
        io.to(`user:${participantId}`).emit("chat:new", chat);
    }
}



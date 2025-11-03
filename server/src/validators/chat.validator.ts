import { z } from "zod";

export const createChatSchema = z.object({
    groupName: z.string().optional(),
    isGroup: z.boolean().default(false),
    participantId: z.string().optional(),
    participants: z.array(z.string()).optional(),
}).refine((data) => {
    if (data.isGroup) {
        return !!data.participants && data.participants.length > 0 && !!data.groupName;
    } else {
        return !!data.participantId;
    }
}, {
    message: "For group chats, participants and groupName are required. For one-on-one chats, participantId is required."
});

export const chatIdSchema = z.object({
    id : z.string().trim().min(1),
})

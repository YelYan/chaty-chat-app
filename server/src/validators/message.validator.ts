import { z }  from "zod";

export const messageSchema = z.object({
    chatId : z.string().trim().min(1),
    content: z.string().optional(),
    image: z.string().optional(),
    replyToId : z.string().trim().optional(),
}).refine((data) => data.content || data.image, {
    message: "Either content or image must be provided.",
    path  : ["content"]
})
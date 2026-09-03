import { z } from "zod";

export const createConversationSchema = z.object({}).strict();
export const updateConversationSchema = z.object({ title: z.string().trim().min(1).max(200) });
export const conversationIdParam = z.object({ id: z.string().min(1) });

import { z } from "zod";

export const chatSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().trim().min(1).max(5000),
});

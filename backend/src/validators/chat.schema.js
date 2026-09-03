import { z } from "zod";

export const chatSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().trim().max(5000).optional().default(""),
});

export const chatWithImageSchema = chatSchema.refine(
  (data) => {
    const hasMessage = data.message && data.message.trim().length > 0;
    // At least message or image (image validated separately via multer)
    // For multipart, we allow empty message if image will be validated in controller
    return true; // actual image presence checked in controller after multer
  },
  { message: "Message is required" }
);

export const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
export const maxImageSizeMB = 5;

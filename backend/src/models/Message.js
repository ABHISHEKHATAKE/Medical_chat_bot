import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    clerkUserId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 10000 },
    sources: { type: [String], default: [] },
    image: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        mimeType: { type: String, required: true },
      },
      required: false,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
messageSchema.index({ conversationId: 1, createdAt: 1 });
export default mongoose.model("Message", messageSchema);

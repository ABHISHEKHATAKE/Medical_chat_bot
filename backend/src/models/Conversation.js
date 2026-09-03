import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    title: { type: String, default: "New conversation", maxlength: 200 },
  },
  { timestamps: true }
);
conversationSchema.index({ clerkUserId: 1, updatedAt: -1 });
export default mongoose.model("Conversation", conversationSchema);

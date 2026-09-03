import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { askRag } from "../services/ai.service.js";

export async function chat(req, res, next) {
  try {
    const { conversationId, message } = req.body;
    const userId = req.userId;

    // Verify ownership
    const convo = await Conversation.findOne({ _id: conversationId, clerkUserId: userId });
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    // Save user message
    await Message.create({ conversationId, clerkUserId: userId, role: "user", content: message });

    // Call Python RAG: use conversationId as session_id (stable per conversation)
    const rag = await askRag({ sessionId: conversationId.toString(), question: message });

    // Save assistant message with sources
    const assistantMsg = await Message.create({
      conversationId,
      clerkUserId: userId,
      role: "assistant",
      content: rag.answer,
      sources: rag.sources,
    });

    // Touch conversation updatedAt for sorting; also auto-title first message (up to 60 chars)
    if (convo.title === "New conversation") {
      const title = message.slice(0, 60);
      convo.title = title;
    }
    convo.updatedAt = new Date();
    await convo.save();

    res.json({ answer: rag.answer, sources: rag.sources, used_context: rag.used_context, message: assistantMsg });
  } catch (e) {
    // Map Python 400 guard refusal to 400
    if (e.status === 400) return res.status(400).json({ error: e.message });
    next(e);
  }
}

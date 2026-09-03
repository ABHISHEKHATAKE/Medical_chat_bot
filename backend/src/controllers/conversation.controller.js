import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export async function createConversation(req, res, next) {
  try {
    const convo = await Conversation.create({ clerkUserId: req.userId, title: "New conversation" });
    res.status(201).json(convo);
  } catch (e) { next(e); }
}
export async function listConversations(req, res, next) {
  try {
    const convos = await Conversation.find({ clerkUserId: req.userId }).sort({ updatedAt: -1 }).lean();
    res.json(convos);
  } catch (e) { next(e); }
}
export async function getConversation(req, res, next) {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, clerkUserId: req.userId });
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    res.json(convo);
  } catch (e) { next(e); }
}
export async function updateConversation(req, res, next) {
  try {
    const convo = await Conversation.findOneAndUpdate(
      { _id: req.params.id, clerkUserId: req.userId },
      { title: req.body.title },
      { new: true }
    );
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    res.json(convo);
  } catch (e) { next(e); }
}
export async function deleteConversation(req, res, next) {
  try {
    const convo = await Conversation.findOneAndDelete({ _id: req.params.id, clerkUserId: req.userId });
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    await Message.deleteMany({ conversationId: convo._id, clerkUserId: req.userId });
    res.json({ ok: true });
  } catch (e) { next(e); }
}
export async function getMessages(req, res, next) {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, clerkUserId: req.userId });
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    const msgs = await Message.find({ conversationId: req.params.id, clerkUserId: req.userId }).sort({ createdAt: 1 }).lean();
    res.json(msgs);
  } catch (e) { next(e); }
}

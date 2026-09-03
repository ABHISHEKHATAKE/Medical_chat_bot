import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { askRag } from "../services/ai.service.js";
import { uploadImage } from "../services/cloudinary.service.js";

export async function chat(req, res, next) {
  try {
    const { conversationId, message, image_url: bodyImageUrl } = req.body;
    const userId = req.userId;
    const rawMessage = (message || "").trim();
    // Support both file upload (new) and image_url (retry with existing Cloudinary URL)
    const hasImageFile = !!req.file;
    const hasImageUrl = !!bodyImageUrl && typeof bodyImageUrl === "string" && bodyImageUrl.startsWith("https://res.cloudinary.com/");
    const hasImage = hasImageFile || hasImageUrl;
    const hasMessage = rawMessage.length > 0;

    // Must have at least message or image
    if (!hasMessage && !hasImage) {
      return res.status(400).json({ error: "Please provide a message or an image." });
    }

    // Verify ownership
    const convo = await Conversation.findOne({ _id: conversationId, clerkUserId: userId });
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    // Handle image upload if present (file) or reuse URL (retry)
    let imageMeta = null;
    let imageUrlForPython = null;
    if (hasImageFile) {
      try {
        console.log(`[Chat] Uploading image for conversation ${conversationId}, type ${req.file.mimetype}, size ${req.file.size}`);
        const result = await uploadImage(req.file, conversationId);
        imageMeta = {
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: req.file.mimetype,
        };
        imageUrlForPython = result.secure_url;
        console.log(`[Chat] Cloudinary upload success: ${imageMeta.publicId}`);
      } catch (uploadErr) {
        console.error("[Chat] Cloudinary upload failed", uploadErr);
        return res.status(502).json({ error: "Unable to process this image. Please try another image." });
      }
    } else if (hasImageUrl) {
      // Retry case: use existing Cloudinary URL, don't re-upload
      // For security, only allow Cloudinary URLs (already validated above)
      // We need to fetch the publicId and mimeType from the last user message if available
      // For now, construct minimal meta from URL
      imageUrlForPython = bodyImageUrl;
      // Try to find the last user message's image meta to reuse
      const lastUserMsg = await Message.findOne({ conversationId, clerkUserId: userId, role: "user", "image.url": bodyImageUrl }).sort({ createdAt: -1 });
      if (lastUserMsg && lastUserMsg.image) {
        imageMeta = lastUserMsg.image;
      } else {
        // Fallback: create minimal meta from URL (extract publicId from URL path)
        try {
          const urlParts = bodyImageUrl.split("/");
          const publicId = urlParts.slice(-3).join("/").replace(/\.[^/.]+$/, ""); // rough
          imageMeta = { url: bodyImageUrl, publicId: publicId || "retry", mimeType: "image/jpeg" };
        } catch {
          imageMeta = { url: bodyImageUrl, publicId: "retry", mimeType: "image/jpeg" };
        }
      }
      console.log(`[Chat] Retry with existing image_url: ${imageUrlForPython.slice(0,60)}...`);
    }

    // For vision, ensure we have a meaningful question; if user sent only image without text, use a safe default
    const questionForRag = hasMessage ? rawMessage : "What is shown in this image? Provide general medical information if relevant.";

    // Deduplicate user message on retry: if last user message has same content and same image url, don't create duplicate
    let isRetry = false;
    if (hasImage || hasMessage) {
      const lastUserMsg = await Message.findOne({ conversationId, clerkUserId: userId, role: "user" }).sort({ createdAt: -1 });
      if (lastUserMsg) {
        const lastContent = (lastUserMsg.content || "").trim();
        const lastImageUrl = lastUserMsg.image?.url || null;
        const currentImageUrl = imageUrlForPython || null;
        if (lastContent === (hasMessage ? rawMessage : "Shared an image") && lastImageUrl === currentImageUrl) {
          // Check if there is no assistant message after it (i.e., previous attempt failed)
          const lastMsgAny = await Message.findOne({ conversationId, clerkUserId: userId }).sort({ createdAt: -1 });
          if (lastMsgAny && lastMsgAny._id.toString() === lastUserMsg._id.toString()) {
            isRetry = true;
            console.log(`[Chat] Detected retry for same message, skipping duplicate user message`);
          }
        }
      }
    }

    if (!isRetry) {
      // Save user message with optional image metadata (only URL/publicId/mime, not binary)
      const userMsgDoc = {
        conversationId,
        clerkUserId: userId,
        role: "user",
        content: hasMessage ? rawMessage : (hasImage ? "Shared an image" : rawMessage),
        sources: [],
      };
      if (imageMeta) userMsgDoc.image = imageMeta;
      else if (hasImageUrl && imageMeta) userMsgDoc.image = imageMeta;
      await Message.create(userMsgDoc);
    }

    // Update title BEFORE the (slow) Python call so the sidebar is correct
    // even if vision/RAG fails. Previously this only ran on success, leaving
    // failed image sends titled "New conversation".
    // Don't use system prompt as title if user pasted it
    if (convo.title === "New conversation") {
      let titleSource = hasMessage ? rawMessage : "Image analysis";
      // If the message looks like the vision system prompt, use a generic title
      if (titleSource.includes("Analyze this image for medically relevant visual information")) {
        titleSource = hasImage ? "Image analysis" : titleSource;
      }
      convo.title = titleSource.slice(0, 60);
    }
    convo.updatedAt = new Date();
    await convo.save();

    // Call Python RAG: use conversationId as session_id, pass imageUrl when present
    // Python will do: image -> vision -> retrieval_query -> existing FAISS -> LLM
    // Text-only: goes directly to existing RAG (no vision overhead)
    if (hasImage) console.log(`[Chat] Calling Python with image_url`);
    else console.log(`[Chat] Calling Python text-only`);

    const rag = await askRag({
      sessionId: conversationId.toString(),
      question: questionForRag,
      imageUrl: imageUrlForPython,
    });

    if (hasImage) console.log(`[Vision] Image analysis completed, retrieval query used`);
    console.log(`[RAG] Retrieved, reranked, final answer generated, used_context=${rag.used_context}`);

    // Save assistant message with sources (image not needed on assistant side)
    const assistantMsg = await Message.create({
      conversationId,
      clerkUserId: userId,
      role: "assistant",
      content: rag.answer,
      sources: rag.sources,
    });

    // Touch updatedAt for sorting after successful answer
    convo.updatedAt = new Date();
    await convo.save();

    res.json({
      answer: rag.answer,
      sources: rag.sources,
      used_context: rag.used_context,
      message: assistantMsg,
      image: imageMeta,
      imageAnalysis: rag.imageAnalysis || null,
    });
  } catch (e) {
    // Map Python 400 guard refusal to 400
    if (e.status === 400) return res.status(400).json({ error: e.message });
    // Vision-specific 503 from Python
    if (e.status === 503 && e.message && e.message.includes("Vision")) {
      return res.status(502).json({ error: "Unable to process this image. Please try another image." });
    }
    next(e);
  }
}

import api from "./api.js";
export const createConversation = () => api.post("/api/conversations").then(r=>r.data);
export const listConversations = () => api.get("/api/conversations").then(r=>r.data);
export const getConversation = (id) => api.get(`/api/conversations/${id}`).then(r=>r.data);
export const updateConversation = (id, title) => api.patch(`/api/conversations/${id}`, {title}).then(r=>r.data);
export const deleteConversation = (id) => api.delete(`/api/conversations/${id}`).then(r=>r.data);
export const getMessages = (id) => api.get(`/api/conversations/${id}/messages`).then(r=>r.data);
export const sendChat = (conversationId, message, imageFile) => {
  if (imageFile) {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("message", message || "");
    formData.append("image", imageFile);
    return api.post("/api/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r=>r.data);
  }
  return api.post("/api/chat", {conversationId, message}).then(r=>r.data);
};
// Retry an image message with the already-uploaded Cloudinary URL (no re-upload).
// Auth (Clerk Bearer / dev header) is attached by the api.js interceptor.
export const sendChatRetry = (conversationId, message, imageUrl) =>
  api.post("/api/chat", { conversationId, message, image_url: imageUrl }).then(r=>r.data);

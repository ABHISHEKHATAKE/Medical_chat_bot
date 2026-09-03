import api from "./api.js";
export const createConversation = () => api.post("/api/conversations").then(r=>r.data);
export const listConversations = () => api.get("/api/conversations").then(r=>r.data);
export const getConversation = (id) => api.get(`/api/conversations/${id}`).then(r=>r.data);
export const updateConversation = (id, title) => api.patch(`/api/conversations/${id}`, {title}).then(r=>r.data);
export const deleteConversation = (id) => api.delete(`/api/conversations/${id}`).then(r=>r.data);
export const getMessages = (id) => api.get(`/api/conversations/${id}/messages`).then(r=>r.data);
export const sendChat = (conversationId, message) => api.post("/api/chat", {conversationId, message}).then(r=>r.data);

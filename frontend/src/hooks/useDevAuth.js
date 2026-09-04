export function getDevUserId() {
  return localStorage.getItem("dev_user_id");
}
export function setDevUserId(id) {
  localStorage.setItem("dev_user_id", id);
}
export function clearDevUserId() {
  localStorage.removeItem("dev_user_id");
}
export function isDevAuthenticated() {
  const id = getDevUserId();
  return !!id && id.trim().length > 0;
}
export { isClerkConfigured } from "../config/auth.js";

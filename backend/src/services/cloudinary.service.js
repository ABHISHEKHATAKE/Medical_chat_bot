import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env");
  }
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
  configured = true;
}

/**
 * Upload a multer file buffer to Cloudinary.
 * @param {Express.Multer.File} file - multer memory storage file
 * @param {string} conversationId - for folder organization
 * @returns {Promise<{secure_url: string, public_id: string, bytes: number}>}
 */
export async function uploadImage(file, conversationId) {
  ensureConfigured();
  const folder = `medichat/conversations/${conversationId}/images`;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
        });
      }
    );
    stream.end(file.buffer);
  });
}

export async function deleteImage(publicId) {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId);
}

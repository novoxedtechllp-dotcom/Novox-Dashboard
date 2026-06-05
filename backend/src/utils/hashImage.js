import crypto from "crypto";

/**
 * Calculates SHA-256 hash of a file/image buffer.
 * @param {Buffer} buffer - The image file buffer.
 * @returns {string} - The SHA-256 hash in hex format.
 */
export const hashImageBuffer = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid buffer provided for hashing");
  }
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

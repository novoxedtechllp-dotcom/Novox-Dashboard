import { cloudinary } from "../config/cloudinary.js";
import { Readable } from "stream";

export const uploadImageToCloudinary = async (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "novox_gallery",
        public_id: originalName ? originalName.split('.')[0] : undefined,
      },
      (error, result) => {
        if (error) {
          reject(new Error("Cloudinary upload failed: " + error.message));
        } else {
          resolve(result);
        }
      }
    );

    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary media ${publicId}:`, error.message);
    throw new Error("Cloudinary delete failed: " + error.message);
  }
};

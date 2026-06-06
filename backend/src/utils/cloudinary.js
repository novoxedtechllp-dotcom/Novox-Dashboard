import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;


    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove file from local server after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Remove the locally saved temporary file as the upload operation failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const splitUrl = url.split("/");
    const filename = splitUrl[splitUrl.length - 1];
    const publicId = filename.split(".")[0];
    return publicId;
  } catch (err) {
    console.error("Error extracting public ID from Cloudinary URL", err);
    return null;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, extractPublicIdFromUrl };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file provided for upload");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  
  if (!uploadResult?.secure_url && !uploadResult?.url) {
    throw new ApiError(500, "Error uploading file to Cloudinary");
  }

  return res.status(200).json(
    new ApiResponse(200, { url: uploadResult.secure_url || uploadResult.url }, "File uploaded successfully")
  );
});

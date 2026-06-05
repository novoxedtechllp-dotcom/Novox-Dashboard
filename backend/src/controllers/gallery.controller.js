import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as galleryService from "../services/gallery.service.js";
import * as gmbService from "../services/gmb.service.js";
import { hashImageBuffer } from "../utils/hashImage.js";

// @desc    Get all gallery images
// @route   GET /api/v1/gallery
export const getGalleryImages = asyncHandler(async (req, res) => {
  const data = await galleryService.getGalleryImagesService();
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Gallery images fetched successfully"));
});

// @desc    Upload new gallery image
// @route   POST /api/v1/gallery/upload
export const uploadGalleryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an image file");
  }

  const { category } = req.body;
  const imageHash = hashImageBuffer(req.file.buffer);

  // Check for duplicate hash in database
  const isDuplicate = await galleryService.checkImageDuplicateService(imageHash);
  if (isDuplicate) {
    throw new ApiError(409, "Duplicate image detected. This image has already been uploaded.");
  }

  // Placeholder implementation since Cloudinary is not integrated yet
  const placeholderUrl = `https://res.cloudinary.com/placeholder-cloud/image/upload/${imageHash}.png`;

  const newImage = await galleryService.addGalleryImageService({
    image_url: placeholderUrl,
    source: "MANUAL",
    category: category || "Uncategorized",
    image_hash: imageHash,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newImage, "Image uploaded successfully (using temporary placeholder URL)"));
});

// @desc    Sync images from GMB
// @route   POST /api/v1/gallery/sync-gmb
export const syncGmbImages = asyncHandler(async (req, res) => {
  // Scaffolding: business logic not implemented yet.
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "GMB images synced successfully"));
});

// @desc    Update gallery image category
// @route   PUT /api/v1/gallery/:id
export const updateGalleryImageCategory = asyncHandler(async (req, res) => {
  // Scaffolding: business logic not implemented yet.
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Image category updated successfully"));
});

// @desc    Delete gallery image
// @route   DELETE /api/v1/gallery/:id
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  // Scaffolding: business logic not implemented yet.
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Image deleted successfully"));
});

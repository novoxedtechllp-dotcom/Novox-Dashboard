import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as galleryService from "../services/gallery.service.js";
import * as gmbService from "../services/gmb.service.js";
import { hashImageBuffer } from "../utils/hashImage.js";

// Valid categories
const VALID_CATEGORIES = ["event", "Ceremony", "Academy", "Uncategorized"];

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
  
  // Validate category if provided
  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  const imageHash = hashImageBuffer(req.file.buffer);

  // Check for duplicate hash in database
  const isDuplicate = await galleryService.checkImageDuplicateService(imageHash);
  if (isDuplicate) {
    throw new ApiError(409, "Duplicate image detected. This image has already been uploaded.");
  }

  // 1. Upload image to GMB
  const gmbMedia = await gmbService.uploadImageToGmb(req.file.buffer, req.file.originalname);

  // 2. Store metadata in Supabase
  const newImage = await galleryService.addGalleryImageService({
    image_url: gmbMedia.googleOptimizedUrl || gmbMedia.sourceUrl,
    source: "DASHBOARD",
    category: category || "Uncategorized",
    image_hash: imageHash,
    gmb_media_key: gmbMedia.name,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newImage, "Image uploaded and synced to GMB successfully"));
});

// @desc    Sync images from GMB
// @route   POST /api/v1/gallery/sync-gmb
export const syncGmbImages = asyncHandler(async (req, res) => {
  const result = await gmbService.syncGmbImages();
  
  return res
    .status(200)
    .json(new ApiResponse(200, result, "GMB images synced successfully"));
});

// @desc    Update gallery image category
// @route   PUT /api/v1/gallery/:id
export const updateGalleryImageCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category || !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  const updatedImage = await galleryService.updateGalleryImageCategoryService(id, category);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedImage, "Image category updated successfully"));
});

// @desc    Delete gallery image
// @route   DELETE /api/v1/gallery/:id
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Lookup gallery record to get gmb_media_key
  const image = await galleryService.getGalleryImageByIdService(id);
  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  // 2. Attempt delete from GMB
  if (image.gmb_media_key) {
    try {
      await gmbService.deleteGmbImage(image.gmb_media_key);
    } catch (error) {
      // Log error but continue with Supabase deletion as per requirements
      console.error(`Failed to delete GMB media ${image.gmb_media_key}:`, error.message);
    }
  }

  // 3. Delete Supabase row
  await galleryService.deleteGalleryImageService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Image deleted successfully"));
});

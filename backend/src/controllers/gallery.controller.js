import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as galleryService from "../services/gallery.service.js";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../services/cloudinary.service.js";
import { cloudinary } from "../config/cloudinary.js";
import { hashImageBuffer } from "../utils/hashImage.js";

// -- Categories --

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, parent_id } = req.body;
  if (!name || !slug) {
    throw new ApiError(400, "Category name and slug are required");
  }

  const category = await galleryService.createCategoryService({ name, slug, parent_id });
  return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await galleryService.getCategoriesService();
  return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// -- Images --

export const getGalleryImages = asyncHandler(async (req, res) => {
  const { search, category_id, page, limit } = req.query;
  const data = await galleryService.getGalleryImagesService({ search, category_id, page, limit });
  return res.status(200).json(new ApiResponse(200, data, "Gallery images fetched successfully"));
});

export const getCloudinaryUsage = asyncHandler(async (req, res) => {
  try {
    const result = await cloudinary.api.usage();
    return res.status(200).json(new ApiResponse(200, result, "Storage usage fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch Cloudinary usage");
  }
});

export const uploadGalleryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an image file");
  }

  const { title, description, category_id, tags } = req.body;
  
  const imageHash = hashImageBuffer(req.file.buffer);

  // Check for duplicate hash
  const existingImage = await galleryService.checkImageDuplicateService(imageHash);
  if (existingImage) {
    if (!existingImage.is_deleted) {
      throw new ApiError(409, "Duplicate image detected. This image has already been uploaded.");
    }
    // If it's soft-deleted, we restore it instead of inserting a new row (which violates UNIQUE constraint)
    const cloudinaryMedia = await uploadImageToCloudinary(req.file.buffer, req.file.originalname);
    
    let parsedTags = [];
    if (tags) {
      try { parsedTags = JSON.parse(tags); } 
      catch (e) { if (typeof tags === 'string') parsedTags = tags.split(',').map(tag => tag.trim()); }
    }

    const restoredImage = await galleryService.updateGalleryImageMetadataService(existingImage.id, {
      title,
      description,
      cloudinary_url: cloudinaryMedia.secure_url,
      cloudinary_public_id: cloudinaryMedia.public_id,
      category_id: category_id || null,
      tags: parsedTags,
      is_deleted: false,
      uploaded_by: req.user?.id || null,
    });
    return res.status(201).json(new ApiResponse(201, restoredImage, "Image restored successfully"));
  }

  // Upload to Cloudinary
  const cloudinaryMedia = await uploadImageToCloudinary(req.file.buffer, req.file.originalname);

  // Parse tags if provided
  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }
  }

  // Store metadata
  const newImage = await galleryService.addGalleryImageService({
    title,
    description,
    cloudinary_url: cloudinaryMedia.secure_url,
    cloudinary_public_id: cloudinaryMedia.public_id,
    image_hash: imageHash,
    category_id: category_id || null,
    tags: parsedTags,
    uploaded_by: req.user?.id || null, // Assuming req.user is set by auth middleware
  });

  return res.status(201).json(new ApiResponse(201, newImage, "Image uploaded successfully"));
});

export const updateGalleryImageMetadata = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category_id, tags } = req.body;

  const metadata = {};
  if (title !== undefined) metadata.title = title;
  if (description !== undefined) metadata.description = description;
  if (category_id !== undefined) metadata.category_id = category_id;
  if (tags !== undefined) metadata.tags = tags;

  const updatedImage = await galleryService.updateGalleryImageMetadataService(id, metadata);

  return res.status(200).json(new ApiResponse(200, updatedImage, "Image metadata updated successfully"));
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // We are performing a soft delete as per schema, so we keep Cloudinary media intact,
  // or we can delete from Cloudinary if it's a hard delete. The schema uses is_deleted.
  // I will just soft delete the record and delete from Cloudinary as well.
  const image = await galleryService.getGalleryImageByIdService(id);
  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  if (image.cloudinary_public_id) {
    try {
      await deleteImageFromCloudinary(image.cloudinary_public_id);
    } catch (error) {
      console.error(`Failed to delete Cloudinary media ${image.cloudinary_public_id}:`, error.message);
    }
  }

  await galleryService.deleteGalleryImageService(id);

  return res.status(200).json(new ApiResponse(200, null, "Image deleted successfully"));
});

export const bulkDeleteGalleryImages = asyncHandler(async (req, res) => {
  const { ids } = req.body; // Expecting an array of ids

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Please provide an array of image IDs");
  }

  for (const id of ids) {
    const image = await galleryService.getGalleryImageByIdService(id);
    if (image && image.cloudinary_public_id) {
      try {
        await deleteImageFromCloudinary(image.cloudinary_public_id);
      } catch (error) {
        console.error(`Failed to delete Cloudinary media ${image.cloudinary_public_id}:`, error.message);
      }
    }
  }

  await galleryService.bulkDeleteGalleryImagesService(ids);

  return res.status(200).json(new ApiResponse(200, null, "Images deleted successfully"));
});

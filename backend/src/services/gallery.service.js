import { supabase } from "../config/supabase.js";

/**
 * Fetches all gallery images from Supabase DB.
 * @returns {Promise<Array>}
 */
export const getGalleryImagesService = async () => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch gallery images");
  }
  return data;
};

/**
 * Checks if an image with the given hash already exists.
 * @param {string} imageHash - SHA-256 hash of the image.
 * @returns {Promise<boolean>} - True if duplicate exists, false otherwise.
 */
export const checkImageDuplicateService = async (imageHash) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id")
    .eq("image_hash", imageHash);

  if (error) {
    throw new Error(error.message || "Failed to check image duplicate");
  }
  return data && data.length > 0;
};

/**
 * Creates/inserts a new gallery image record.
 * @param {Object} imageData - Image metadata
 * @returns {Promise<Object>}
 */
export const addGalleryImageService = async (imageData) => {
  const { image_url, source, category, image_hash, gmb_media_key } = imageData;

  const { data, error } = await supabase
    .from("gallery_images")
    .insert([{ image_url, source, category: category || "Uncategorized", image_hash, gmb_media_key }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to add image to gallery");
  }
  return data;
};

/**
 * Updates an existing gallery image's category.
 * @param {string} id - Gallery image ID
 * @param {string} category - New category
 * @returns {Promise<Object>}
 */
export const updateGalleryImageCategoryService = async (id, category) => {
  // Scaffolding: business logic not implemented yet.
  return {};
};

/**
 * Deletes a gallery image from Supabase.
 * @param {string} id - Gallery image ID
 * @returns {Promise<Object>}
 */
export const deleteGalleryImageService = async (id) => {
  // Scaffolding: business logic not implemented yet.
  return {};
};

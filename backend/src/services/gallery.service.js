import { supabase } from "../config/supabase.js";

// -- Categories --

export const createCategoryService = async (categoryData) => {
  const { data, error } = await supabase
    .from("gallery_categories")
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create category");
  }
  return data;
};

export const getCategoriesService = async () => {
  const { data, error } = await supabase
    .from("gallery_categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch categories");
  }
  return data;
};

// -- Images --

export const getGalleryImagesService = async ({ search, category_id, page = 1, limit = 50 }) => {
  let query = supabase
    .from("gallery_images")
    .select(`
      *,
      category:gallery_categories(name, slug)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (category_id) {
    query = query.eq("category_id", category_id);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to fetch gallery images");
  }
  return data;
};

export const getGalleryImageByIdService = async (id) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }
  return data;
};

export const checkImageDuplicateService = async (imageHash) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id")
    .eq("image_hash", imageHash)
    .eq("is_deleted", false);

  if (error) {
    throw new Error(error.message || "Failed to check image duplicate");
  }
  return data && data.length > 0;
};

export const addGalleryImageService = async (imageData) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .insert([imageData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to add image to gallery");
  }
  return data;
};

export const updateGalleryImageMetadataService = async (id, metadata) => {
  // metadata can include title, description, category_id, tags
  metadata.updated_at = new Date();
  
  const { data, error } = await supabase
    .from("gallery_images")
    .update(metadata)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update image metadata");
  }
  return data;
};

export const deleteGalleryImageService = async (id) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .update({ is_deleted: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to mark image as deleted");
  }
  return data;
};

export const bulkDeleteGalleryImagesService = async (ids) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .update({ is_deleted: true })
    .in("id", ids)
    .select();

  if (error) {
    throw new Error(error.message || "Failed to bulk delete images");
  }
  return data;
};

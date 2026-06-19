import { supabase } from "../config/supabase.js";

// -- Websites --

export const getWebsitesService = async () => {
  const { data, error } = await supabase
    .from("gallery_websites")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message || "Failed to fetch websites");
  return data;
};

export const createWebsiteService = async (websiteData) => {
  const { data, error } = await supabase
    .from("gallery_websites")
    .insert([websiteData])
    .select()
    .single();
  if (error) throw new Error(error.message || "Failed to create website");
  return data;
};

export const deleteWebsiteService = async (id) => {
  const { error } = await supabase
    .from("gallery_websites")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message || "Failed to delete website");
  return true;
};

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

export const deleteCategoryService = async (id) => {
  const { error } = await supabase
    .from("gallery_categories")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message || "Failed to delete category");
  return true;
};

export const getCategoriesService = async (website_id) => {
  let query = supabase
    .from("gallery_categories")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (website_id) {
    query = query.eq("website_id", website_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to fetch categories");
  }
  return data;
};

// -- Images --

export const getGalleryImagesService = async ({ search, category_id, website_id, page = 1, limit = 50 }) => {
  let selectStr = `
    *,
    categories:gallery_image_categories(
      category:gallery_categories(id, name, slug)
    )
  `;
  
  if (category_id) {
    // Inner join to filter by category
    selectStr = `
      *,
      filter_cat:gallery_image_categories!inner(category_id),
      categories:gallery_image_categories(
        category:gallery_categories(id, name, slug)
      )
    `;
  }

  let query = supabase
    .from("gallery_images")
    .select(selectStr)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (category_id) {
    query = query.eq("filter_cat.category_id", category_id);
  }
  if (website_id) {
    query = query.eq("website_id", website_id);
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

export const checkImageDuplicateService = async (imageHash, website_id) => {
  let query = supabase
    .from("gallery_images")
    .select("id, is_deleted")
    .eq("image_hash", imageHash);

  if (website_id) {
    query = query.eq("website_id", website_id);
  } else {
    query = query.is("website_id", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to check image duplicate");
  }
  return data && data.length > 0 ? data[0] : null;
};

export const getGalleryImageCategoriesService = async (imageId) => {
  const { data, error } = await supabase
    .from("gallery_image_categories")
    .select("category_id")
    .eq("image_id", imageId);

  if (error) {
    throw new Error(error.message || "Failed to fetch image categories");
  }
  return data.map(row => row.category_id);
};

export const addGalleryImageService = async (imageData, categoryIds = []) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .insert([imageData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to add image to gallery");
  }

  if (categoryIds && categoryIds.length > 0) {
    const junctionData = categoryIds.map(cid => ({ image_id: data.id, category_id: cid }));
    await supabase.from("gallery_image_categories").insert(junctionData);
  }

  return data;
};

export const updateGalleryImageMetadataService = async (id, metadata, categoryIds = null) => {
  // metadata can include title, description, tags, website_id
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

  if (categoryIds !== null) {
    // Delete existing
    await supabase.from("gallery_image_categories").delete().eq("image_id", id);
    // Insert new
    if (categoryIds.length > 0) {
      const junctionData = categoryIds.map(cid => ({ image_id: id, category_id: cid }));
      await supabase.from("gallery_image_categories").insert(junctionData);
    }
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

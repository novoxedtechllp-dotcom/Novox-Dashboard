import { ApiError } from "../utils/ApiError.js";
import { hashImageBuffer } from "../utils/hashImage.js";
import * as galleryService from "./gallery.service.js";

/**
 * Retrieves a fresh access token using the refresh token.
 * @returns {Promise<string>} - The new access token.
 */
const getAccessToken = async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new ApiError(500, "Missing OAuth2 credentials (Client ID, Secret, or Refresh Token)");
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token Refresh Failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new ApiError(500, `OAuth Error: ${error.message}`);
  }
};

/**
 * Downloads an image from a URL and returns a Buffer.
 */
const downloadImageBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new ApiError(500, `Image Download Error: ${error.message}`);
  }
};

/**
 * Uploads an image to Google Business Profile (GBP) using the 3-step process.
 * @param {Buffer} buffer - The image buffer to upload.
 * @returns {Promise<Object>} - The GBP media item object.
 */
export const uploadImageToGmb = async (buffer) => {
  const accountId = process.env.GMB_ACCOUNT_ID;
  const locationId = process.env.GMB_LOCATION_ID;
  const accessToken = await getAccessToken();

  if (!accountId || !locationId) {
    throw new ApiError(500, "Missing GBP Account ID or Location ID");
  }

  const baseEndpoint = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/media`;

  try {
    // STEP 1: Start Upload
    const startUploadRes = await fetch(`${baseEndpoint}:startUpload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Length": "0",
      },
    });

    if (!startUploadRes.ok) {
      const errorData = await startUploadRes.json();
      throw new Error(`Step 1 (startUpload) Failed: ${errorData.error?.message || startUploadRes.statusText}`);
    }

    const { resourceName } = await startUploadRes.json();

    // STEP 2: Upload Bytes
    const uploadBytesRes = await fetch(`https://mybusiness.googleapis.com/upload/v1/media/${resourceName}?upload_type=media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "image/jpeg", // Assuming JPEG for now, ideally dynamic
      },
      body: buffer,
    });

    if (!uploadBytesRes.ok) {
      throw new Error(`Step 2 (uploadBytes) Failed: ${uploadBytesRes.statusText}`);
    }

    // STEP 3: Create Media Item
    const createMediaRes = await fetch(baseEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaFormat: "PHOTO",
        locationAssociation: {
          category: "ADDITIONAL",
        },
        dataRef: {
          resourceName: resourceName,
        },
      }),
    });

    if (!createMediaRes.ok) {
      const errorData = await createMediaRes.json();
      throw new Error(`Step 3 (createMedia) Failed: ${errorData.error?.message || createMediaRes.statusText}`);
    }

    return await createMediaRes.json();
  } catch (error) {
    throw new ApiError(500, `GBP Upload Error: ${error.message}`);
  }
};

/**
 * Fetches media items from GBP.
 */
export const fetchGmbImages = async () => {
  const accountId = process.env.GMB_ACCOUNT_ID;
  const locationId = process.env.GMB_LOCATION_ID;
  const accessToken = await getAccessToken();

  if (!accountId || !locationId) {
    throw new ApiError(500, "Missing GBP Account ID or Location ID");
  }

  try {
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GBP Fetch Failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.mediaItems || [];
  } catch (error) {
    throw new ApiError(500, `GBP Fetch Error: ${error.message}`);
  }
};

/**
 * Deletes an image from GBP.
 * @param {string} gmbMediaKey - The resource name format: accounts/{accId}/locations/{locId}/media/{mediaId}
 */
export const deleteGmbImage = async (gmbMediaKey) => {
  const accessToken = await getAccessToken();

  try {
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${gmbMediaKey}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      throw new Error(`GBP Delete Failed: ${errorData.error?.message || response.statusText}`);
    }
  } catch (error) {
    console.error(`GBP Deletion Error for ${gmbMediaKey}:`, error.message);
    throw error;
  }
};

/**
 * Synchronizes images from GBP to Supabase.
 */
export const syncGmbImages = async () => {
  const gmbMediaItems = await fetchGmbImages();
  let addedCount = 0;
  let skippedCount = 0;

  for (const item of gmbMediaItems) {
    try {
      const imageUrl = item.googleOptimizedUrl || item.sourceUrl;
      if (!imageUrl) continue;

      const buffer = await downloadImageBuffer(imageUrl);
      const imageHash = hashImageBuffer(buffer);

      const isDuplicate = await galleryService.checkImageDuplicateService(imageHash);
      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      await galleryService.addGalleryImageService({
        image_url: imageUrl,
        source: "GMB",
        category: "Uncategorized",
        image_hash: imageHash,
        gmb_media_key: item.name,
      });
      addedCount++;
    } catch (error) {
      console.error(`Sync error for item ${item.name}:`, error.message);
    }
  }

  return { added: addedCount, skipped: skippedCount, total: gmbMediaItems.length };
};

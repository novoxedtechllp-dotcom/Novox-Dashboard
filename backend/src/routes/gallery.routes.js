import { Router } from "express";
import {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImageMetadata,
  deleteGalleryImage,
  bulkDeleteGalleryImages,
  createCategory,
  deleteCategory,
  deleteWebsite,
  getCategories,
  getCloudinaryUsage,
  getWebsites,
  createWebsite
} from "../controllers/gallery.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes for fetching
router.route("/").get(getGalleryImages);
router.route("/websites").get(getWebsites);
router.route("/categories").get(getCategories);
router.route("/storage-usage").get(getCloudinaryUsage);

// Protect all management operations (Admin only)
// Note: We parse the upload first for the upload route to prevent Vite proxy EPIPE errors
// when auth rejects the request before the multipart body is fully streamed.
router.post("/upload", upload.single("image"), verifyJWT, authorize({ roles: [ROLES.ADMIN] }), uploadGalleryImage);

router.use(verifyJWT);
router.use(authorize({ roles: [ROLES.ADMIN] }));

router.route("/websites").post(createWebsite);
router.route("/websites/:id").delete(deleteWebsite);
router.route("/categories").post(createCategory);
router.route("/categories/:id").delete(deleteCategory);
router.route("/bulk-delete").post(bulkDeleteGalleryImages);
router.route("/:id")
  .put(updateGalleryImageMetadata)
  .delete(deleteGalleryImage);

export default router;

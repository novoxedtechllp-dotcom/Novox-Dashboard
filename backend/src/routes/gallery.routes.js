import { Router } from "express";
import {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImageMetadata,
  deleteGalleryImage,
  bulkDeleteGalleryImages,
  createCategory,
  getCategories
} from "../controllers/gallery.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes for fetching
router.route("/").get(getGalleryImages);
router.route("/categories").get(getCategories);

// Protect all management operations (Admin only)
router.use(verifyJWT);
router.use(authorize({ roles: [ROLES.ADMIN] }));

router.route("/categories").post(createCategory);
router.route("/upload").post(upload.single("image"), uploadGalleryImage);
router.route("/bulk-delete").post(bulkDeleteGalleryImages);
router.route("/:id")
  .put(updateGalleryImageMetadata)
  .delete(deleteGalleryImage);

export default router;

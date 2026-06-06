import { Router } from "express";
import {
  getGalleryImages,
  uploadGalleryImage,
  syncGmbImages,
  updateGalleryImageCategory,
  deleteGalleryImage,
} from "../controllers/gallery.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public route to fetch all gallery images
router.route("/").get(getGalleryImages);

// Protect all other operations (Admin only)
router.use(verifyJWT);
router.use(authorize({ roles: [ROLES.ADMIN] }));

router.route("/upload").post(upload.single("image"), uploadGalleryImage);
router.route("/sync-gmb").post(syncGmbImages);
router.route("/:id").put(updateGalleryImageCategory).delete(deleteGalleryImage);

export default router;

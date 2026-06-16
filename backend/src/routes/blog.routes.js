import { Router } from 'express';
import {
  getConfig,
  generateDraft,
  generateImageOnly,
  publishPost,
  deletePost,
  streamImage,
  listBlogs,
  getBlogDetails,
  verifyPasscode
} from '../controllers/blog.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// We apply verifyJWT to protect these routes so only logged-in employees/admins can access them
// If verifyJWT sets req.user, it's safe.
router.use(verifyJWT);

// Proxy Routes
router.route('/config').get(getConfig);
router.route('/generate').post(generateDraft);
router.route('/generate-image-only').post(generateImageOnly);
router.route('/publish').post(publishPost);
router.route('/:filename/delete').post(deletePost);
router.route('/image').get(streamImage); // local: /api/v1/blogs/image -> remote: /api/blogs-image
router.route('/').get(listBlogs); // local: /api/v1/blogs -> remote: /api/blogs
router.route('/:filename').get(getBlogDetails);
router.route('/verify-passcode').post(verifyPasscode);

export default router;

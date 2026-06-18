import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { askQuestion } from "../controllers/rag.controller.js";

const router = Router();

// Only authenticated users can access this, further role checks are in controller
router.use(verifyJWT);

router.post("/ask", askQuestion);

export default router;

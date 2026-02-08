import { Router } from "express";
import {
  sendCode,
  signup,
  signin,
  githubCallback,
  getMe,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/auth/send-code", sendCode);
router.post("/auth/signup", signup);
router.post("/auth/signin", signin);
router.post("/auth/github/callback", githubCallback);
router.get("/auth/me", authMiddleware, getMe);

export default router;

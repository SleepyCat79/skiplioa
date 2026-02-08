import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getUsers,
  getUser,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

router.use(authMiddleware);

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);

export default router;

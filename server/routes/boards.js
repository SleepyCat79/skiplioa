import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  inviteMember,
  respondInvitation,
  getInvitations,
} from "../controllers/boardController.js";

const router = Router();

router.use(authMiddleware);

router.get("/boards", getBoards);
router.post("/boards", createBoard);
router.get("/boards/:id", getBoard);
router.put("/boards/:id", updateBoard);
router.delete("/boards/:id", deleteBoard);

router.post("/boards/:boardId/invite", inviteMember);
router.post("/boards/:boardId/invite/respond", respondInvitation);

router.get("/invitations", getInvitations);

export default router;

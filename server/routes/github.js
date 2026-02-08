import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getRepoInfo,
  attachGitHub,
  getGitHubAttachments,
  removeGitHubAttachment,
} from "../controllers/githubController.js";

const router = Router();

router.use(authMiddleware);

router.get("/repositories/:repositoryId/github-info", getRepoInfo);
router.post(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach",
  attachGitHub,
);
router.get(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments",
  getGitHubAttachments,
);
router.delete(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId",
  removeGitHubAttachment,
);

export default router;

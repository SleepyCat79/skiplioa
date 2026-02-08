import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getTasks,
  getAllBoardTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignMember,
  getAssignedMembers,
  removeAssignment,
} from "../controllers/taskController.js";

const router = Router();

router.use(authMiddleware);

router.get("/boards/:boardId/tasks", getAllBoardTasks);
router.get("/boards/:boardId/cards/:id/tasks", getTasks);
router.post("/boards/:boardId/cards/:id/tasks", createTask);
router.get("/boards/:boardId/cards/:id/tasks/:taskId", getTask);
router.put("/boards/:boardId/cards/:id/tasks/:taskId", updateTask);
router.delete("/boards/:boardId/cards/:id/tasks/:taskId", deleteTask);

router.post("/boards/:boardId/cards/:id/tasks/:taskId/assign", assignMember);
router.get(
  "/boards/:boardId/cards/:id/tasks/:taskId/assign",
  getAssignedMembers,
);
router.delete(
  "/boards/:boardId/cards/:id/tasks/:taskId/assign/:memberId",
  removeAssignment,
);

export default router;

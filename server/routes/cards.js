import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getCardsByUser,
} from "../controllers/cardController.js";

const router = Router();

router.use(authMiddleware);

router.get("/boards/:boardId/cards", getCards);
router.post("/boards/:boardId/cards", createCard);
router.get("/boards/:boardId/cards/user/:user_id", getCardsByUser);
router.get("/boards/:boardId/cards/:id", getCard);
router.put("/boards/:boardId/cards/:id", updateCard);
router.delete("/boards/:boardId/cards/:id", deleteCard);

export default router;

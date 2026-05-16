import { Router } from "express";
import { analyzeController } from "../controllers/analyze.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const analyzeRouter = Router();

analyzeRouter.post("/analyze", authMiddleware, analyzeController.analyze);

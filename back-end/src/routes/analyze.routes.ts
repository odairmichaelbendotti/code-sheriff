import { Router } from "express";
import { analyzeController } from "../controllers/analyze.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const analyzeRouter = Router();

analyzeRouter.post(
  "/analyze/preview",
  authMiddleware,
  analyzeController.getChangedFiles,
);

analyzeRouter.post("/analyze/run", authMiddleware, analyzeController.run);

analyzeRouter.get(
  "/analyze/history",
  authMiddleware,
  analyzeController.history,
);

analyzeRouter.delete(
  "/analyze/history/:id",
  authMiddleware,
  analyzeController.deleteAnalysis,
);

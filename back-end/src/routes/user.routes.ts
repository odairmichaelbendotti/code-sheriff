import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const userRouter = Router();

userRouter.get("/me", authMiddleware, userController.pulls);

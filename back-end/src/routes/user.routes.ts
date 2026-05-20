import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const userRouter = Router();

/**
 * @openapi
 * /api/pulls:
 *   get:
 *     summary: List open pull requests for the authenticated user
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of open pull requests across all repos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   number:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   html_url:
 *                     type: string
 *                   state:
 *                     type: string
 *                   repository:
 *                     type: object
 *                     properties:
 *                       full_name:
 *                         type: string
 *       400:
 *         description: GitHub account not linked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.get("/pulls", authMiddleware, userController.pulls);

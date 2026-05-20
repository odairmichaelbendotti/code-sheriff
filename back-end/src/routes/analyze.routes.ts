import { Router } from "express";
import { analyzeController } from "../controllers/analyze.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const analyzeRouter = Router();

/**
 * @openapi
 * /api/analyze/preview:
 *   post:
 *     summary: Fetch changed files from a GitHub PR
 *     tags: [Analyze]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://github.com/owner/repo/pull/42
 *     responses:
 *       200:
 *         description: List of changed files in the PR
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrFile'
 *       400:
 *         description: Invalid PR URL
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
analyzeRouter.post(
  "/analyze/preview",
  authMiddleware,
  analyzeController.getChangedFiles,
);

/**
 * @openapi
 * /api/analyze/run:
 *   post:
 *     summary: Run AI analysis on a PR and stream findings via SSE
 *     tags: [Analyze]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [owner, repo, prNumber, files]
 *             properties:
 *               owner:
 *                 type: string
 *                 example: octocat
 *               repo:
 *                 type: string
 *                 example: hello-world
 *               prNumber:
 *                 type: string
 *                 example: "42"
 *               files:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PrFile'
 *     responses:
 *       200:
 *         description: |
 *           Server-Sent Events stream. Each line is a `data:` event with JSON payload.
 *           Event types: `agent_start`, `finding`, `agent_done`, `done`.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {"type":"agent_start","agent":"security"}
 *                 data: {"type":"finding","agent":"security","severity":"critical","file":"src/auth.ts","line":12,"message":"Hardcoded secret detected"}
 *                 data: {"type":"done"}
 *       400:
 *         description: Missing required parameters
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
 */
analyzeRouter.post("/analyze/run", authMiddleware, analyzeController.run);

/**
 * @openapi
 * /api/analyze/history:
 *   get:
 *     summary: List past analyses for the authenticated user
 *     tags: [Analyze]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of past analyses ordered by date descending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Analysis'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
analyzeRouter.get(
  "/analyze/history",
  authMiddleware,
  analyzeController.history,
);

/**
 * @openapi
 * /api/analyze/history/{id}:
 *   delete:
 *     summary: Delete an analysis by ID
 *     tags: [Analyze]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Analysis not found
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
analyzeRouter.delete(
  "/analyze/history/:id",
  authMiddleware,
  analyzeController.deleteAnalysis,
);

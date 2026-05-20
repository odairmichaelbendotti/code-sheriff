import type { Request, Response } from "express";
import { PrUrlParser } from "../utils/PrUrlParser.js";
import { findAccountByUserId } from "../services/findAccountByUserId.js";
import { getChangedFiles } from "../services/getChangedFiles.js";
import { getFileContent } from "../services/getFileContent.js";
import { getBranchName } from "../services/getBranchName.js";
import { orchestrator } from "../agents/orchestrator.js";
import { prisma } from "../lib/prisma.js";

type PrFile = {
  filename: string;
  patch: string | undefined;
  status: string;
  sha: string;
  additions: number;
  deletions: number;
};

export const analyzeController = {
  getChangedFiles: async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      const parts = PrUrlParser(url);

      if (!parts.owner || !parts.repo || !parts.prNumber) {
        return res.status(400).json({ error: "Invalid PR URL" });
      }

      const account = await findAccountByUserId(req.session.userId);

      if (!account || typeof account.accessToken !== "string") {
        return res.status(404).json({ error: "Account not found" });
      }

      const pullChangedFiles = await getChangedFiles({
        owner: parts.owner,
        repo: parts.repo,
        prNumber: parts.prNumber,
        accessToken: account.accessToken,
      });

      res.status(200).json(pullChangedFiles);
    } catch {
      return res.status(500).json({ error: "Internal error" });
    }
  },
  run: async (req: Request, res: Response) => {
    const { owner, repo, prNumber, files } = req.body as {
      owner: string;
      repo: string;
      prNumber: string;
      files: PrFile[];
    };

    if (!owner || !repo || !prNumber || !files) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const account = await findAccountByUserId(req.session.userId);

    if (!account || typeof account.accessToken !== "string") {
      return res.status(404).json({ error: "Account not found" });
    }

    const accessToken: string = account.accessToken;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const branchName = await getBranchName({
      accessToken: accessToken,
      owner,
      repo,
      prNumber,
    });

    const CODE_EXTENSIONS =
      /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|swift|c|cpp|h|cs|php|rb|vue|svelte|sql|sh|yaml|yml|json|toml)$/i;

    const ENV_FILES = /^\.env(\..+)?$/i;

    const BLOCKED_FILES = new Set([
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "Cargo.lock",
      "composer.lock",
      "Gemfile.lock",
    ]);

    const BLOCKED_EXTENSIONS = /\.(md|mdx|txt|png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot)$/i;

    const BLOCKED_PATHS = /(\b|\/)(node_modules|\.git|dist|build|\.next|\.nuxt|coverage|\.cache)(\/|$)/i;

    const codeFiles = files.filter((f) => {
      if (f.status === "removed") return false;
      if (BLOCKED_PATHS.test(f.filename)) return false;
      const basename = f.filename.split("/").pop() ?? f.filename;
      if (BLOCKED_FILES.has(basename)) return false;
      if (BLOCKED_EXTENSIONS.test(f.filename)) return false;
      return CODE_EXTENSIONS.test(f.filename) || ENV_FILES.test(basename);
    });

    const result = await Promise.all(
      codeFiles.map((file) =>
        getFileContent({
          accessToken: accessToken,
          owner,
          repo,
          filename: file.filename,
          branchName,
        }).then((content) => ({
          filename: file.filename,
          content: content.content,
          patch: file.patch,
          status: file.status,
        })),
      ),
    );

    await orchestrator(result, res, {
      userId: req.session.userId,
      owner,
      repo,
      prNumber,
    });
  },
  history: async (req: Request, res: Response) => {
    try {
      const analyses = await prisma.analysis.findMany({
        where: { userId: req.session.userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          owner: true,
          repo: true,
          prNumber: true,
          criticalCount: true,
          warningCount: true,
          suggestionCount: true,
          findings: true,
          createdAt: true,
        },
      });

      return res.status(200).json(analyses);
    } catch {
      return res.status(500).json({ error: "Internal error" });
    }
  },
};

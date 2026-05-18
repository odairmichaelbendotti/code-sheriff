import type { Request, Response } from "express";
import { PrUrlParser } from "../utils/PrUrlParser.js";
import { findAccountByUserId } from "../services/findAccountByUserId.js";
import { getChangedFiles } from "../services/getChangedFiles.js";
import { getFileContent } from "../services/getFileContent.js";
import { getBranchName } from "../services/getBranchName.js";
import { orchestrator } from "../agents/orchestrator.js";

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

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      const pullChangedFiles = await getChangedFiles({
        owner: parts.owner,
        repo: parts.repo,
        prNumber: parts.prNumber,
        accessToken: account.accessToken,
      });

      res.status(200).json(pullChangedFiles);
    } catch (error) {
      return res.status(500).json({ error: "Internal error" });
    }
  },
  run: async (req: Request, res: Response) => {
    const { owner, repo, prNumber, files, agents } = req.body as {
      owner: string;
      repo: string;
      prNumber: string;
      files: PrFile[];
      agents: string[];
    };

    if (!owner || !repo || !prNumber || !files) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const account = await findAccountByUserId(req.session.userId);

    if (!account || typeof account.accessToken !== "string") {
      return res.status(404).json({ error: "Account not found" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const branchName = await getBranchName({
      accessToken: account.accessToken,
      owner,
      repo,
      prNumber,
    });

    const result = await Promise.all(
      files.map((file) =>
        getFileContent({
          accessToken: account.accessToken!!,
          owner,
          repo,
          filename: file.filename,
          branchName,
        }).then((content) => ({
          filename: file.filename,
          content: content.content,
          patch: file.patch,
        })),
      ),
    );

    await orchestrator(result, agents as ("security" | "performance" | "quality")[], res);
  },
};

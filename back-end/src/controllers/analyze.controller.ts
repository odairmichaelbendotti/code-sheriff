import type { Request, Response } from "express";
import { PrUrlParser } from "../utils/PrUrlParser.js";
import { findAccountByUserId } from "../services/findAccountByUserId.js";
import { getChangedFiles } from "../services/getChangedFiles.js";
import { getFileContent } from "../services/getFileContent.js";
import { getBranchName } from "../services/getBranchName.js";

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
  getFileContet: async (req: Request, res: Response) => {
    const { owner, repo, prNumber, filenames } = req.body;

    if (!owner || !repo || !prNumber || !filenames) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const account = await findAccountByUserId(req.session.userId);

    if (!account || !account.accessToken) {
      return res.status(404).json({ error: "Account not found" });
    }

    const branchName = await getBranchName({
      accessToken: account.accessToken,
      owner,
      repo,
      prNumber,
    });

    const files = await Promise.all(
      filenames.map((filename: string) => {
        return getFileContent({
          accessToken: account?.accessToken!!,
          owner: owner,
          repo: repo,
          filename: filename,
          branchName,
        });
      }),
    );

    res.status(200).json(files);
  },
};

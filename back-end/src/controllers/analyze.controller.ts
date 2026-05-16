import type { Request, Response } from "express";
import { PrUrlParser } from "../utils/PrUrlParser.js";
import { findAccountByUserId } from "../services/findAccountByUserId.js";
import { getPullChangedFiles } from "../services/getPullChangedFiles.js";

export const analyzeController = {
  analyze: async (req: Request, res: Response) => {
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

      const pullChangedFiles = await getPullChangedFiles({
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
};

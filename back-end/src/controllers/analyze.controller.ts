import type { Request, Response } from "express";
import { PrUrlParser } from "../utils/PrUrlParser.js";
import { findAccountByUserId } from "../services/findAccountByUserId.js";
import { getChangedFiles } from "../services/getChangedFiles.js";
import { getFileContent } from "../services/getFileContent.js";
import { getBranchName } from "../services/getBranchName.js";

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
  getFileContet: async (req: Request, res: Response) => {
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

    const branchName = await getBranchName({
      accessToken: account.accessToken,
      owner,
      repo,
      prNumber,
    });

    // content é o conteúdo inteiro e diff é o patch, ou seja, as linhas adicionadas e removidas. O ideal é ter ambos para fazer uma análise mais completa, mas se for necessário escolher um, o conteúdo inteiro pode fornecer mais contexto para a análise, enquanto o patch foca apenas nas mudanças específicas.
    const result = await Promise.all(
      files.map((file) =>
        getFileContent({
          accessToken: account.accessToken!!,
          owner,
          repo,
          filename: file.filename,
          branchName,
        }).then((content) => ({ ...content, patch: file.patch })),
      ),
    );

    res.status(200).json(result);
  },
};

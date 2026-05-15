import type { Request, Response } from "express";
import { findAccountByUserId } from "../services/findAccountByUserId.js";
import { getPullsByUser } from "../services/getPullsByUser.js";

export const userController = {
  pulls: async (req: Request, res: Response) => {
    try {
      const account = await findAccountByUserId(req.user.id);
      console.log(account);

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      if (!account.accessToken) {
        return res.status(400).json({ error: "GitHub account not linked" });
      }

      const pulls = await getPullsByUser(account.accessToken);

      res.status(200).json({ pulls: pulls });
    } catch (error) {
      return res.status(500).json({ error: "Internal error" });
    }
  },
};

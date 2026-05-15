import type { Request, Response } from "express";
import { findAccountByUserId } from "../services/findAccountByUserId.js";

export const userController = {
  pulls: async (req: Request, res: Response) => {
    try {
      // const account = await findAccountByUserId()
    } catch (error) {
      return res.status(500).json({ error: "Internal error" });
    }

    res.json({ user: req.user, session: req.session });
  },
};

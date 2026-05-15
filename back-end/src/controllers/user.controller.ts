import type { Request, Response } from "express";

export const userController = {
  getUsers: async (req: Request, res: Response) => {
    res.json({ message: "ok" });
  },
};

import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      return res.status(401).json({ error: "Token not provided" });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
}

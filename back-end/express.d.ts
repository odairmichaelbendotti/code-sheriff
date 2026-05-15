// server/types/express.d.ts
import { Session, User } from "better-auth";

declare global {
  namespace Express {
    interface Request {
      user: User;
      session: Session;
    }
  }
}

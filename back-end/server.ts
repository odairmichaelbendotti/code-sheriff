import express from "express";
import { userRouter } from "./src/routes/user.routes.js";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "./src/lib/auth.js";
import { analyzeRouter } from "./src/routes/analyze.routes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", analyzeRouter);

app.listen(4000, () => {
  console.log("http://localhost:4000");
});

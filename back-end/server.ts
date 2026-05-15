import express from "express";
import { userRouter } from "./src/routes/user.routes.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json());
app.use("/api", userRouter);

app.listen(4000, () => {
  console.log("http://localhost:4000");
});

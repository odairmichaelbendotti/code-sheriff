import express from "express";
import { userRouter } from "./src/routes/user.routes.js";

const app = express();

app.use("/api", userRouter);

app.listen(4000, () => {
  console.log("http://localhost:4000");
});

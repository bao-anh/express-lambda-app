import express from "express";
import healthRouter from "./routes/health.js";

const app = express();

app.use(express.json());
app.use("/health", healthRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Hello world, Welcome to the Express API running on AWS Lambda.",
  });
});

export default app;

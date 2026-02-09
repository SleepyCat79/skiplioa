import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { initSocket } from "./services/socketService.js";

import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import cardRoutes from "./routes/cards.js";
import taskRoutes from "./routes/tasks.js";
import userRoutes from "./routes/users.js";
import githubRoutes from "./routes/github.js";

dotenv.config();

const requiredEnvVars = [
  "JWT_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = express();
const server = createServer(app);

initSocket(server);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", boardRoutes);
app.use("/api", cardRoutes);
app.use("/api", taskRoutes);
app.use("/api", userRoutes);
app.use("/api", githubRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("SIGTERM", () => {
  server.close();
});

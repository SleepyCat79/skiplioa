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

console.log("Initializing server...");
console.log("Environment check:", {
  port: process.env.PORT,
  clientUrl: process.env.CLIENT_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  hasJwtSecret: !!process.env.JWT_SECRET,
});

const app = express();
const server = createServer(app);

console.log("Initializing Socket.IO...");
initSocket(server);
console.log("Socket.IO initialized");

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Public health check endpoint (before routes)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(authRoutes);
app.use(boardRoutes);
app.use(cardRoutes);
app.use(taskRoutes);
app.use(userRoutes);
app.use(githubRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error middleware:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on("error", (err) => {
  console.error("Server error:", err);
});

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  console.error("Stack:", err.stack);
  // Don't exit the process
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  // Don't exit the process
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

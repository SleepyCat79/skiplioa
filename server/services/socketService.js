import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:board", (boardId) => {
      socket.join(`board:${boardId}`);
    });

    socket.on("leave:board", (boardId) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function emitToBoardRoom(boardId, event, data) {
  if (io) {
    io.to(`board:${boardId}`).emit(event, data);
  }
}

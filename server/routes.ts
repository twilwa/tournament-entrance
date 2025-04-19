import { Router } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleChatCompletion, handleStreamingChatCompletion } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  const apiRouter = Router();
  
  // AI endpoints
  apiRouter.post("/chat", handleChatCompletion);
  apiRouter.post("/chat/stream", handleStreamingChatCompletion);

  // Apply API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);

  return httpServer;
}

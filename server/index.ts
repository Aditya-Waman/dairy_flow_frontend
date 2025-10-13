import "dotenv/config";
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Proxy all /api requests to the Fastify backend
  const backendUrl = process.env.BACKEND_URL || " https://dairy-flow-backend.onrender.com";
  
  app.use("/api", createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).json({
        success: false,
        error: "Backend service unavailable",
        message: "Unable to connect to backend service"
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward authorization header
      if (req.headers.authorization) {
        proxyReq.setHeader('authorization', req.headers.authorization);
      }
    }
  }));

  // Example API routes (fallback if backend is not available)
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}

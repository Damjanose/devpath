import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { config } from "./config";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: false,  // Allow inline scripts from Vite build
}));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, please try again later" },
});
app.use("/api/auth", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// --- Serve frontend static files in production ---
if (!config.isDev) {
  const frontendDist = path.resolve(__dirname, "../../dist");
  app.use(express.static(frontendDist));

  // SPA fallback: any non-API route serves index.html
  app.get("*", (_req, res, _next) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Error handling (only for API 404s in production, all 404s in dev)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

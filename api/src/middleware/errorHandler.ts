import { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/ApiError";
import { config } from "../config";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    status: "error",
    message: config.isDev ? err.message : "Internal server error",
  });
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound("Route not found"));
}

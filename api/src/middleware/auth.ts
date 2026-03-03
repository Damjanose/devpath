import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthRequest, AuthPayload } from "../types";
import { ApiError } from "../lib/ApiError";

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
    } else {
      next(ApiError.unauthorized("Invalid or expired token"));
    }
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      req.user = decoded;
    }
  } catch {
    // Token invalid — proceed without user
  }
  next();
}

import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../types";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName } = req.body;
      const result = await authService.register(email, password, displayName);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        status: "success",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ status: "success", message: "Logged out" });
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId);
      res.json({ status: "success", data: user });
    } catch (err) {
      next(err);
    }
  },
};

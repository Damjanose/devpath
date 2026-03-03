import { Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { AuthRequest } from "../types";

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.user!.userId);
      res.json({ status: "success", data: profile });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.updateProfile(req.user!.userId, req.body);
      res.json({ status: "success", data: profile });
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await userService.getDashboard(req.user!.userId);
      res.json({ status: "success", data: dashboard });
    } catch (err) {
      next(err);
    }
  },
};

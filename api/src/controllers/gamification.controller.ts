import { Request, Response, NextFunction } from "express";
import { gamificationService } from "../services/gamification.service";
import { AuthRequest } from "../types";

export const gamificationController = {
  // Badge CRUD (admin)
  async listBadges(_req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await gamificationService.listBadges();
      res.json({ status: "success", data: badges });
    } catch (err) {
      next(err);
    }
  },

  async createBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const badge = await gamificationService.createBadge(req.body);
      res.status(201).json({ status: "success", data: badge });
    } catch (err) {
      next(err);
    }
  },

  async updateBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const badge = await gamificationService.updateBadge(req.params.id as string, req.body);
      res.json({ status: "success", data: badge });
    } catch (err) {
      next(err);
    }
  },

  async deleteBadge(req: Request, res: Response, next: NextFunction) {
    try {
      await gamificationService.deleteBadge(req.params.id as string);
      res.json({ status: "success", message: "Badge deleted" });
    } catch (err) {
      next(err);
    }
  },

  // User badges
  async getMyBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const badges = await gamificationService.getUserBadges(req.user!.userId);
      res.json({ status: "success", data: badges });
    } catch (err) {
      next(err);
    }
  },

  // Leaderboard
  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const leaderboard = await gamificationService.getLeaderboard(limit);
      res.json({ status: "success", data: leaderboard });
    } catch (err) {
      next(err);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { courseService } from "../services/course.service";
import { AuthRequest } from "../types";

export const courseController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      // Admins see all courses; others see only published
      const isAdmin = req.user?.role === "admin";
      const result = await courseService.list(page, limit, !isAdmin);
      res.json({ status: "success", ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getById(req.params.id as string, true);
      res.json({ status: "success", data: course });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await courseService.create({
        ...req.body,
        createdBy: req.user!.userId,
      });
      res.status(201).json({ status: "success", data: course });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.update(req.params.id as string, req.body);
      res.json({ status: "success", data: course });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await courseService.delete(req.params.id as string);
      res.json({ status: "success", message: "Course deleted" });
    } catch (err) {
      next(err);
    }
  },
};

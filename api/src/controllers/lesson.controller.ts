import { Request, Response, NextFunction } from "express";
import { lessonService } from "../services/lesson.service";
import { AuthRequest } from "../types";

export const lessonController = {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const lesson = await lessonService.getById(req.params.id as string);
      res.json({ status: "success", data: lesson });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const lesson = await lessonService.create(req.body);
      res.status(201).json({ status: "success", data: lesson });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const lesson = await lessonService.update(req.params.id as string, req.body);
      res.json({ status: "success", data: lesson });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await lessonService.delete(req.params.id as string);
      res.json({ status: "success", message: "Lesson deleted" });
    } catch (err) {
      next(err);
    }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await lessonService.complete(req.params.id as string, req.user!.userId);
      res.json({ status: "success", data: result });
    } catch (err) {
      next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await lessonService.reorder(req.params.moduleId as string, req.body.lessonIds);
      res.json({ status: "success", message: "Lessons reordered" });
    } catch (err) {
      next(err);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { moduleService } from "../services/module.service";

export const moduleController = {
  async listByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await moduleService.listByCourse(req.params.courseId as string);
      res.json({ status: "success", data: modules });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await moduleService.getById(req.params.id as string);
      res.json({ status: "success", data: mod });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await moduleService.create(req.body);
      res.status(201).json({ status: "success", data: mod });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await moduleService.update(req.params.id as string, req.body);
      res.json({ status: "success", data: mod });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await moduleService.delete(req.params.id as string);
      res.json({ status: "success", message: "Module deleted" });
    } catch (err) {
      next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      await moduleService.reorder(req.params.courseId as string, req.body.moduleIds);
      res.json({ status: "success", message: "Modules reordered" });
    } catch (err) {
      next(err);
    }
  },
};

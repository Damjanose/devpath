import { Response, NextFunction, Request } from "express";
import { enrollmentService } from "../services/enrollment.service";
import { AuthRequest } from "../types";

export const enrollmentController = {
  async enroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.enroll(req.user!.userId, req.body.courseId);
      res.status(201).json({ status: "success", data: enrollment });
    } catch (err) {
      next(err);
    }
  },

  async enrollGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, email } = req.body;
      const enrollment = await enrollmentService.enrollGuest(courseId, email);
      res.status(201).json({ status: "success", data: enrollment });
    } catch (err) {
      next(err);
    }
  },

  async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(req.user!.userId);
      res.json({ status: "success", data: enrollments });
    } catch (err) {
      next(err);
    }
  },

  async getProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await enrollmentService.getUserProgress(req.user!.userId, req.params.courseId as string);
      res.json({ status: "success", data: progress });
    } catch (err) {
      next(err);
    }
  },
};

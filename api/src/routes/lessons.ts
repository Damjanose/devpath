import { Router } from "express";
import { lessonController } from "../controllers/lesson.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const createLessonSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  contentType: z.enum(["text", "video", "quiz", "code_example", "coding_challenge"]).optional(),
  pointsReward: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  contentType: z.enum(["text", "video", "quiz", "code_example", "coding_challenge"]).optional(),
  pointsReward: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
});

const reorderSchema = z.object({ lessonIds: z.array(z.string().uuid()) });

// Public
router.get("/:id", lessonController.getById);
router.post("/:id/complete-by-email", lessonController.completeByEmail);

// Authenticated user
router.post("/:id/complete", authenticate, lessonController.complete);

// Admin only
router.post("/", authenticate, requireRole("admin"), validate(createLessonSchema), lessonController.create);
router.put("/:id", authenticate, requireRole("admin"), validate(updateLessonSchema), lessonController.update);
router.delete("/:id", authenticate, requireRole("admin"), lessonController.delete);
router.put("/module/:moduleId/reorder", authenticate, requireRole("admin"), validate(reorderSchema), lessonController.reorder);

export default router;

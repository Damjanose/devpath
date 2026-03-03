import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { authenticate, optionalAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  pointsReward: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

// Public / auth-optional
router.get("/", optionalAuth, courseController.list);
router.get("/:id", courseController.getById);

// Admin only
router.post("/", authenticate, requireRole("admin"), validate(createCourseSchema), courseController.create);
router.put("/:id", authenticate, requireRole("admin"), validate(updateCourseSchema), courseController.update);
router.delete("/:id", authenticate, requireRole("admin"), courseController.delete);

export default router;

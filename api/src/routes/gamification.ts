import { Router } from "express";
import { gamificationController } from "../controllers/gamification.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const createBadgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  iconUrl: z.string().url().optional().or(z.literal("")),
  conditionType: z.enum(["points_total", "courses_completed", "lessons_completed", "streak_days", "course_completed"]),
  conditionValue: z.number().int().min(1),
  courseId: z.string().uuid().optional(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
});

const updateBadgeSchema = createBadgeSchema.partial();

// Public
router.get("/platform-stats", gamificationController.getPlatformStats);
router.get("/leaderboard", gamificationController.getLeaderboard);

// Authenticated
router.get("/badges", authenticate, gamificationController.listBadges);
router.get("/my-badges", authenticate, gamificationController.getMyBadges);

// Admin only
router.post("/badges", authenticate, requireRole("admin"), validate(createBadgeSchema), gamificationController.createBadge);
router.put("/badges/:id", authenticate, requireRole("admin"), validate(updateBadgeSchema), gamificationController.updateBadge);
router.delete("/badges/:id", authenticate, requireRole("admin"), gamificationController.deleteBadge);

export default router;

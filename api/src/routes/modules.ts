import { Router } from "express";
import { moduleController } from "../controllers/module.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

const createModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  moduleIds: z.array(z.string().uuid()),
});

// Public
router.get("/course/:courseId", moduleController.listByCourse);
router.get("/:id", moduleController.getById);

// Admin only
router.post("/", authenticate, requireRole("admin"), validate(createModuleSchema), moduleController.create);
router.put("/:id", authenticate, requireRole("admin"), validate(updateModuleSchema), moduleController.update);
router.delete("/:id", authenticate, requireRole("admin"), moduleController.delete);
router.put("/course/:courseId/reorder", authenticate, requireRole("admin"), validate(reorderSchema), moduleController.reorder);

export default router;

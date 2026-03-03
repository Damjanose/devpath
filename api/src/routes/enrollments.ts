import { Router } from "express";
import { enrollmentController } from "../controllers/enrollment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, enrollmentController.enroll);
router.get("/my", authenticate, enrollmentController.getMyEnrollments);
router.get("/progress/:courseId", authenticate, enrollmentController.getProgress);

export default router;

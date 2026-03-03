import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import courseRoutes from "./courses";
import moduleRoutes from "./modules";
import lessonRoutes from "./lessons";
import enrollmentRoutes from "./enrollments";
import gamificationRoutes from "./gamification";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/modules", moduleRoutes);
router.use("/lessons", lessonRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/gamification", gamificationRoutes);

export default router;

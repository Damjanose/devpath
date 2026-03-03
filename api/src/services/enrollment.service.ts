import prisma from "../lib/prisma";
import { ApiError } from "../lib/ApiError";
import bcrypt from "bcryptjs";

export const enrollmentService = {
  async enroll(userId: string, courseId: string) {
    // Check course exists and is published
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw ApiError.notFound("Course not found");
    if (!course.isPublished) throw ApiError.badRequest("Course is not available");

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw ApiError.conflict("Already enrolled in this course");

    return prisma.enrollment.create({
      data: { userId, courseId },
      include: { course: true },
    });
  },

  async enrollGuest(courseId: string, email: string) {
    // Check course exists and is published
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw ApiError.notFound("Course not found");
    if (!course.isPublished) throw ApiError.badRequest("Course is not available");

    // Try to find or create user by email
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create a user with a random password for guest enrollments
      const randomPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          profile: { create: { displayName: email.split("@")[0], totalPoints: 0, level: 1 } },
          roles: { create: { role: "user" } },
        },
      });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (existing) throw ApiError.conflict("Already enrolled in this course");

    return prisma.enrollment.create({
      data: { userId: user.id, courseId },
      include: { course: true },
    });
  },

  async getUserEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getUserEnrollmentsByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return [];
    
    return prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  },

  async getUserProgress(userId: string, courseId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const modules = await prisma.module.findMany({
      where: { courseId },
      select: { id: true },
    });
    const moduleIds = modules.map((m) => m.id);

    const completedLessonIds = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: { moduleId: { in: moduleIds } },
      },
      select: { lessonId: true },
    });

    return {
      enrollment,
      completedLessonIds: completedLessonIds.map((cl) => cl.lessonId),
    };
  },
};

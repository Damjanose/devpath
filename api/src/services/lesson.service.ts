import prisma from "../lib/prisma";
import { ApiError } from "../lib/ApiError";
import { ContentType } from "@prisma/client";

interface CreateLessonData {
  moduleId: string;
  title: string;
  content?: string;
  contentType?: ContentType;
  pointsReward?: number;
  sortOrder?: number;
  estimatedMinutes?: number;
}

interface UpdateLessonData {
  title?: string;
  content?: string;
  contentType?: ContentType;
  pointsReward?: number;
  sortOrder?: number;
  estimatedMinutes?: number;
}

export const lessonService = {
  async getById(id: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: { id: true, title: true, courseId: true },
        },
      },
    });
    if (!lesson) throw ApiError.notFound("Lesson not found");
    return lesson;
  },

  async create(data: CreateLessonData) {
    if (data.sortOrder === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId: data.moduleId },
        orderBy: { sortOrder: "desc" },
      });
      data.sortOrder = (lastLesson?.sortOrder ?? -1) + 1;
    }
    return prisma.lesson.create({ data });
  },

  async update(id: string, data: UpdateLessonData) {
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Lesson not found");
    return prisma.lesson.update({ where: { id }, data });
  },

  async delete(id: string) {
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Lesson not found");
    await prisma.lesson.delete({ where: { id } });
  },

  async complete(lessonId: string, userId: string) {
    // Check if already completed
    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (existing) {
      return { alreadyCompleted: true, pointsEarned: 0, newBadges: [] };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { select: { courseId: true } },
      },
    });
    if (!lesson) throw ApiError.notFound("Lesson not found");

    // Use a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Insert lesson progress
      await tx.lessonProgress.create({
        data: {
          userId,
          lessonId,
          pointsEarned: lesson.pointsReward,
        },
      });

      // 2. Update user points and level
      const profile = await tx.profile.findUnique({ where: { userId } });
      const newPoints = (profile?.totalPoints ?? 0) + lesson.pointsReward;
      const newLevel = Math.floor(newPoints / 500) + 1;

      await tx.profile.update({
        where: { userId },
        data: { totalPoints: newPoints, level: newLevel },
      });

      // 3. Recalculate course progress
      const courseId = lesson.module.courseId;
      const allModules = await tx.module.findMany({
        where: { courseId },
        select: { id: true },
      });
      const moduleIds = allModules.map((m) => m.id);

      const totalLessons = await tx.lesson.count({
        where: { moduleId: { in: moduleIds } },
      });

      const completedLessons = await tx.lessonProgress.count({
        where: {
          userId,
          lesson: { moduleId: { in: moduleIds } },
        },
      });

      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const isComplete = progress >= 100;

      // Check if enrollment exists and if already completed
      const enrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      let courseXpAwarded = 0;
      if (enrollment) {
        const updateData: any = { progressPercentage: progress };

        if (isComplete && !enrollment.completedAt) {
          updateData.completedAt = new Date();

          // Award course completion XP
          const course = await tx.course.findUnique({
            where: { id: courseId },
            select: { pointsReward: true },
          });
          if (course) {
            courseXpAwarded = course.pointsReward;
            const finalPoints = newPoints + courseXpAwarded;
            const finalLevel = Math.floor(finalPoints / 500) + 1;
            await tx.profile.update({
              where: { userId },
              data: { totalPoints: finalPoints, level: finalLevel },
            });
          }
        }

        await tx.enrollment.update({
          where: { userId_courseId: { userId, courseId } },
          data: updateData,
        });
      }

      // 4. Check badge eligibility
      const updatedProfile = await tx.profile.findUnique({ where: { userId } });
      const allBadges = await tx.badge.findMany();
      const earnedBadgeIds = (
        await tx.userBadge.findMany({
          where: { userId },
          select: { badgeId: true },
        })
      ).map((ub) => ub.badgeId);

      const totalCompletedCourses = await tx.enrollment.count({
        where: { userId, completedAt: { not: null } },
      });
      const totalCompletedLessons = await tx.lessonProgress.count({
        where: { userId },
      });

      const newBadges: Array<{ id: string; name: string; tier: string; description: string | null }> = [];

      for (const badge of allBadges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let qualified = false;
        switch (badge.conditionType) {
          case "points_total":
            qualified = (updatedProfile?.totalPoints ?? 0) >= badge.conditionValue;
            break;
          case "courses_completed":
            qualified = totalCompletedCourses >= badge.conditionValue;
            break;
          case "lessons_completed":
            qualified = totalCompletedLessons >= badge.conditionValue;
            break;
          case "course_completed": {
            if (badge.courseId) {
              const courseEnrollment = await tx.enrollment.findFirst({
                where: { userId, courseId: badge.courseId, completedAt: { not: null } },
              });
              qualified = !!courseEnrollment;
            }
            break;
          }
          case "streak_days":
            // Streak tracking deferred — skip for now
            break;
        }

        if (qualified) {
          await tx.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          newBadges.push({
            id: badge.id,
            name: badge.name,
            tier: badge.tier,
            description: badge.description,
          });
        }
      }

      return {
        alreadyCompleted: false,
        pointsEarned: lesson.pointsReward + courseXpAwarded,
        lessonXp: lesson.pointsReward,
        courseXp: courseXpAwarded,
        progress,
        isComplete,
        newLevel: updatedProfile?.level ?? newLevel,
        totalPoints: updatedProfile?.totalPoints ?? newPoints,
        newBadges,
      };
    });

    return result;
  },

  async completeByEmail(lessonId: string, email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ApiError.notFound("User not found");
    return this.complete(lessonId, user.id);
  },

  async reorder(moduleId: string, lessonIds: string[]) {
    const updates = lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { sortOrder: index },
      })
    );
    await prisma.$transaction(updates);
  },
};

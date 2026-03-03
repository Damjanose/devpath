import prisma from "../lib/prisma";
import { ApiError } from "../lib/ApiError";

export const userService = {
  async getProfile(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) throw ApiError.notFound("Profile not found");
    return profile;
  },

  async updateProfile(userId: string, data: { displayName?: string; bio?: string; avatarUrl?: string }) {
    const profile = await prisma.profile.update({
      where: { userId },
      data,
    });
    return profile;
  },

  async getDashboard(userId: string) {
    const [profile, enrollments, badges, lessonProgressCount] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
      prisma.lessonProgress.count({ where: { userId } }),
    ]);

    return {
      profile,
      enrollments,
      badges: badges.map((ub) => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      stats: {
        totalPoints: profile?.totalPoints ?? 0,
        level: profile?.level ?? 1,
        coursesEnrolled: enrollments.length,
        coursesCompleted: enrollments.filter((e) => e.completedAt).length,
        lessonsCompleted: lessonProgressCount,
      },
    };
  },
};

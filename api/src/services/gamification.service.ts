import prisma from "../lib/prisma";
import { ApiError } from "../lib/ApiError";
import { BadgeTier, ConditionType } from "@prisma/client";

interface CreateBadgeData {
  name: string;
  description?: string;
  iconUrl?: string;
  conditionType: ConditionType;
  conditionValue: number;
  tier?: BadgeTier;
}

interface UpdateBadgeData {
  name?: string;
  description?: string;
  iconUrl?: string;
  conditionType?: ConditionType;
  conditionValue?: number;
  tier?: BadgeTier;
}

export const gamificationService = {
  // Badge CRUD
  async listBadges() {
    return prisma.badge.findMany({
      orderBy: [{ conditionType: "asc" }, { conditionValue: "asc" }],
    });
  },

  async createBadge(data: CreateBadgeData) {
    return prisma.badge.create({ data });
  },

  async updateBadge(id: string, data: UpdateBadgeData) {
    const existing = await prisma.badge.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Badge not found");
    return prisma.badge.update({ where: { id }, data });
  },

  async deleteBadge(id: string) {
    const existing = await prisma.badge.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Badge not found");
    await prisma.badge.delete({ where: { id } });
  },

  // User badges
  async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
  },

  // Leaderboard
  async getLeaderboard(limit = 20) {
    const profiles = await prisma.profile.findMany({
      orderBy: { totalPoints: "desc" },
      take: limit,
      select: {
        userId: true,
        displayName: true,
        avatarUrl: true,
        totalPoints: true,
        level: true,
      },
    });

    return profiles.map((p, index) => ({
      rank: index + 1,
      ...p,
    }));
  },

  // Check and award badges for a user
  async checkAndAwardBadges(userId: string) {
    const [profile, allBadges, earnedBadges, completedCourses, completedLessons] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.badge.findMany(),
      prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
      prisma.enrollment.count({ where: { userId, completedAt: { not: null } } }),
      prisma.lessonProgress.count({ where: { userId } }),
    ]);

    const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));
    const newBadges: Array<{ id: string; name: string; tier: string; description: string | null }> = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let qualified = false;
      switch (badge.conditionType) {
        case "points_total":
          qualified = (profile?.totalPoints ?? 0) >= badge.conditionValue;
          break;
        case "courses_completed":
          qualified = completedCourses >= badge.conditionValue;
          break;
        case "lessons_completed":
          qualified = completedLessons >= badge.conditionValue;
          break;
        case "streak_days":
          // Deferred
          break;
      }

      if (qualified) {
        await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
        newBadges.push({
          id: badge.id,
          name: badge.name,
          tier: badge.tier,
          description: badge.description,
        });
      }
    }

    return newBadges;
  },
};

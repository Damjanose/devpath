import prisma from "../lib/prisma";
import { ApiError } from "../lib/ApiError";
import { Difficulty } from "@prisma/client";

interface CreateCourseData {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  difficulty?: Difficulty;
  pointsReward?: number;
  isPublished?: boolean;
  createdBy?: string;
}

interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  difficulty?: Difficulty;
  pointsReward?: number;
  isPublished?: boolean;
}

export const courseService = {
  async list(page = 1, limit = 20, publishedOnly = true) {
    const where = publishedOnly ? { isPublished: true } : {};
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { modules: true, enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string, includeContent = false) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: includeContent
            ? {
                lessons: {
                  orderBy: { sortOrder: "asc" },
                },
              }
            : {
                lessons: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    id: true,
                    title: true,
                    contentType: true,
                    pointsReward: true,
                    sortOrder: true,
                    estimatedMinutes: true,
                  },
                },
              },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw ApiError.notFound("Course not found");
    return course;
  },

  async create(data: CreateCourseData) {
    return prisma.course.create({ data });
  },

  async update(id: string, data: UpdateCourseData) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Course not found");
    return prisma.course.update({ where: { id }, data });
  },

  async delete(id: string) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Course not found");
    await prisma.course.delete({ where: { id } });
  },
};

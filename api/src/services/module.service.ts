import prisma from "../lib/prisma";
import { ApiError } from "../lib/ApiError";

interface CreateModuleData {
  courseId: string;
  title: string;
  description?: string;
  sortOrder?: number;
}

interface UpdateModuleData {
  title?: string;
  description?: string;
  sortOrder?: number;
}

export const moduleService = {
  async listByCourse(courseId: string) {
    return prisma.module.findMany({
      where: { courseId },
      orderBy: { sortOrder: "asc" },
      include: {
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
        _count: { select: { lessons: true } },
      },
    });
  },

  async getById(id: string) {
    const mod = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!mod) throw ApiError.notFound("Module not found");
    return mod;
  },

  async create(data: CreateModuleData) {
    // Auto-set sort_order to be after the last module
    if (data.sortOrder === undefined) {
      const lastModule = await prisma.module.findFirst({
        where: { courseId: data.courseId },
        orderBy: { sortOrder: "desc" },
      });
      data.sortOrder = (lastModule?.sortOrder ?? -1) + 1;
    }
    return prisma.module.create({ data });
  },

  async update(id: string, data: UpdateModuleData) {
    const existing = await prisma.module.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Module not found");
    return prisma.module.update({ where: { id }, data });
  },

  async delete(id: string) {
    const existing = await prisma.module.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Module not found");
    await prisma.module.delete({ where: { id } });
  },

  async reorder(courseId: string, moduleIds: string[]) {
    const updates = moduleIds.map((id, index) =>
      prisma.module.update({
        where: { id },
        data: { sortOrder: index },
      })
    );
    await prisma.$transaction(updates);
  },
};

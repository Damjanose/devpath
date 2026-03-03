import { PrismaClient, ContentType } from "@prisma/client";

const prisma = new PrismaClient();

// ── Types ────────────────────────────────────────────────────
export interface CourseInput {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  pointsReward: number;
}

export interface LessonInput {
  title: string;
  content: string;
  contentType?: ContentType;
  pointsReward?: number;
  estimatedMinutes?: number;
  // Coding challenge fields
  starterCode?: string;
  testCode?: string;
  solutionCode?: string;
  bonusPoints?: number;
  hints?: string[];
  language?: string;
}

export interface ModuleInput {
  title: string;
  description: string;
  lessons: LessonInput[];
}

// ── Helper ───────────────────────────────────────────────────
export async function seedCourse(
  adminId: string,
  course: CourseInput,
  modules: ModuleInput[]
) {
  const created = await prisma.course.create({
    data: {
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      pointsReward: course.pointsReward,
      isPublished: true,
      createdBy: adminId,
    },
  });

  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi];
    const createdMod = await prisma.module.create({
      data: {
        courseId: created.id,
        title: mod.title,
        description: mod.description,
        sortOrder: mi,
      },
    });

    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];
      await prisma.lesson.create({
        data: {
          moduleId: createdMod.id,
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType ?? "text",
          pointsReward: lesson.pointsReward ?? 10,
          estimatedMinutes: lesson.estimatedMinutes ?? 8,
          sortOrder: li,
          // Coding challenge fields
          ...(lesson.starterCode && { starterCode: lesson.starterCode }),
          ...(lesson.testCode && { testCode: lesson.testCode }),
          ...(lesson.solutionCode && { solutionCode: lesson.solutionCode }),
          ...(lesson.bonusPoints !== undefined && { bonusPoints: lesson.bonusPoints }),
          ...(lesson.hints && lesson.hints.length > 0 && { hints: lesson.hints }),
          ...(lesson.language && { language: lesson.language }),
        },
      });
    }
  }

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  console.log(
    `  📘 ${course.title} — ${modules.length} modules, ${totalLessons} lessons`
  );
  return created;
}

export { prisma };

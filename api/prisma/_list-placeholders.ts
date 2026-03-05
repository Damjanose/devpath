import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // Get all PLACEHOLDER lessons for courses that have them
  const courseIds = [
    "d75a9fd1-a64c-4d29-ba26-b4d80f94dc58", // Web Fundamentals
    "b09bd532-1b2a-47b6-882c-c932190260ad", // Ultimate Next.js
    "38485a14-0534-413a-a45f-900dfeece0db", // Node.js Express
  ];

  for (const cid of courseIds) {
    const course = await p.course.findUnique({
      where: { id: cid },
      include: {
        modules: {
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!course) continue;
    console.log(`\n=== ${course.title} ===`);
    for (const m of course.modules) {
      const phLessons = m.lessons.filter(l => (l.content?.length || 0) <= 250);
      if (phLessons.length === 0) continue;
      console.log(`\n  Module: ${m.title} (${phLessons.length} placeholder)`);
      for (const l of phLessons) {
        console.log(`    [${l.contentType}] "${l.title}" — id: ${l.id}`);
      }
    }
  }

  await p.$disconnect();
}

main().catch(console.error);

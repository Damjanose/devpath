import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // Count PLACEHOLDER lessons per course
  const courses = await p.course.findMany({
    include: {
      modules: {
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const c of courses) {
    let ph = 0, full = 0;
    for (const m of c.modules) {
      for (const l of m.lessons) {
        if ((l.content?.length || 0) > 250) full++;
        else ph++;
      }
    }
    if (ph > 0) {
      console.log(`${c.title}: ${ph} PLACEHOLDER, ${full} FULL`);
    }
  }

  // Show a sample PLACEHOLDER lesson
  console.log("\n--- Sample PLACEHOLDER lesson ---");
  const placeholder = await p.lesson.findFirst({
    where: {
      content: { not: null },
      module: { course: { id: "b09bd532-1b2a-47b6-882c-c932190260ad" } }
    },
    include: { module: true },
    orderBy: { sortOrder: "asc" }
  });

  if (placeholder && (placeholder.content?.length || 0) <= 250) {
    console.log(`Title: ${placeholder.title}`);
    console.log(`Type: ${placeholder.contentType}`);
    console.log(`Content:\n${placeholder.content}`);
    console.log(`Starter code:\n${placeholder.starterCode?.substring(0, 300)}`);
  }

  // Show a PLACEHOLDER from Node.js Express
  console.log("\n--- Sample PLACEHOLDER from Node.js Express ---");
  const ph2 = await p.lesson.findFirst({
    where: {
      module: { course: { id: "38485a14-0534-413a-a45f-900dfeece0db" } },
      contentType: "text"
    },
    include: { module: true },
    orderBy: { sortOrder: "asc" }
  });

  if (ph2) {
    console.log(`Title: ${ph2.title}`);
    console.log(`Content length: ${ph2.content?.length}`);
    console.log(`Content:\n${ph2.content?.substring(0, 500)}`);
  }

  await p.$disconnect();
}

main().catch(console.error);

import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
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
    console.log(`\n=== ${c.title} (${c.id}) ===`);
    let challengeCount = 0;
    let withCode = 0;
    let withoutCode = 0;
    
    for (const m of c.modules) {
      for (const l of m.lessons) {
        if (l.contentType === "coding_challenge") {
          challengeCount++;
          const hasStarter = (l.starterCode?.length || 0) > 10;
          const hasTest = (l.testCode?.length || 0) > 10;
          const hasSolution = (l.solutionCode?.length || 0) > 10;
          
          if (hasStarter && hasTest && hasSolution) {
            withCode++;
          } else {
            withoutCode++;
            console.log(`  MISSING CODE: ${l.title}`);
            console.log(`    starter: ${l.starterCode?.length || 0} chars | test: ${l.testCode?.length || 0} chars | solution: ${l.solutionCode?.length || 0} chars`);
          }
        }
      }
    }
    console.log(`  Summary: ${challengeCount} challenges | ${withCode} complete | ${withoutCode} missing code`);
  }

  // Also check a couple of text lessons for formatting quality
  console.log("\n\n--- Sample text lesson content check ---");
  const sampleLesson = await p.lesson.findFirst({
    where: { 
      contentType: "text",
      content: { not: null }
    },
    include: { module: { include: { course: true } } },
    orderBy: { createdAt: "asc" }
  });
  
  if (sampleLesson) {
    console.log(`\nCourse: ${sampleLesson.module.course.title}`);
    console.log(`Lesson: ${sampleLesson.title}`);
    console.log(`Content (first 500 chars):\n${sampleLesson.content?.substring(0, 500)}`);
  }

  await p.$disconnect();
}

main().catch(console.error);

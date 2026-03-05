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
    console.log(`\n=== ${c.title} ===`);
    console.log(`  id: ${c.id} | difficulty: ${c.difficulty} | courseXP: ${c.pointsReward} | modules: ${c.modules.length}`);
    let totalXp = 0;
    for (const m of c.modules) {
      console.log(`  Module: ${m.title} (${m.lessons.length} lessons)`);
      for (const l of m.lessons) {
        totalXp += l.pointsReward;
        const hasReal = (l.content?.length || 0) > 250;
        const flag = hasReal ? "FULL" : "PLACEHOLDER";
        console.log(`    ${l.pointsReward} xp | ${l.contentType.padEnd(18)} | ${flag.padEnd(12)} | ${l.title}`);
      }
    }
    console.log(`  Total lesson XP: ${totalXp}`);
  }
  await p.$disconnect();
}

main().catch(console.error);

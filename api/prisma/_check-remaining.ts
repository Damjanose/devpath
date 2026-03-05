import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  // Check both courses
  const courseIds = [
    "b09bd532-1b2a-47b6-882c-c932190260ad", // Ultimate Next.js
    "38485a14-0534-413a-a45f-900dfeece0db", // Node.js & Express
  ];
  for (const cid of courseIds) {
    const lessons = await p.lesson.findMany({
      where: { module: { courseId: cid } },
      select: { id: true, title: true, content: true, sortOrder: true, module: { select: { title: true, sortOrder: true } } },
    });
    lessons.sort((a, b) => a.module.sortOrder - b.module.sortOrder || a.sortOrder - b.sortOrder);
    let short = 0;
    let full = 0;
    let curMod = "";
    for (const l of lessons) {
      const isShort = l.content.length < 250;
      if (isShort) short++;
      else full++;
      if (isShort) {
        if (l.module.title !== curMod) {
          curMod = l.module.title;
          console.log("\n=== M" + l.module.sortOrder + ": " + curMod + " ===");
        }
        console.log(l.id + " | " + l.title + " | len=" + l.content.length);
      }
    }
    const course = await p.course.findUnique({ where: { id: cid }, select: { title: true } });
    console.log("\n--- " + (course?.title ?? cid) + " ---");
    console.log("Short:", short, "| Full:", full, "| Total:", lessons.length);
    console.log("");
  }
  await p.$disconnect();
}
main();

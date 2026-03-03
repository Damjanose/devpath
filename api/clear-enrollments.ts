import prisma from "./src/lib/prisma";

async function clearEnrollments() {
  try {
    await prisma.$connect();
    console.log("🗑️  Clearing all enrollments and progress...\n");
    
    // Delete all enrollments
    const enrollmentResult = await prisma.enrollment.deleteMany({});
    console.log(`✅ Deleted ${enrollmentResult.count} enrollments`);
    
    // Optional: Also clear lesson progress if you want a complete reset
    const progressResult = await prisma.lessonProgress.deleteMany({});
    console.log(`✅ Deleted ${progressResult.count} lesson progress records`);
    
    // Optional: Reset user points and levels
    const profileResult = await prisma.profile.updateMany({
      data: {
        totalPoints: 0,
        level: 1,
      },
    });
    console.log(`✅ Reset ${profileResult.count} user profiles to level 1 with 0 points`);
    
    console.log("\n🎓 All users have been unenrolled and progress cleared");
    console.log("💡 Tip: Users should clear localStorage or logout/login to refresh frontend\n");
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error clearing enrollments:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

clearEnrollments();

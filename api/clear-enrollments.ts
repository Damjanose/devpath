import prisma from "./src/lib/prisma";

async function clearAllProgress() {
  try {
    await prisma.$connect();
    console.log("🗑️  Clearing ALL user progress (keeping users and courses)...\n");
    
    // Delete all user badges
    const badgesResult = await prisma.userBadge.deleteMany({});
    console.log(`✅ Deleted ${badgesResult.count} user badges`);
    
    // Delete all lesson progress
    const progressResult = await prisma.lessonProgress.deleteMany({});
    console.log(`✅ Deleted ${progressResult.count} lesson progress records`);
    
    // Delete all enrollments
    const enrollmentResult = await prisma.enrollment.deleteMany({});
    console.log(`✅ Deleted ${enrollmentResult.count} enrollments`);
    
    // Reset ALL user profiles to level 1 with 0 points
    const profileResult = await prisma.profile.updateMany({
      data: {
        totalPoints: 0,
        level: 1,
      },
    });
    console.log(`✅ Reset ${profileResult.count} user profiles to Level 1 with 0 XP`);
    
    console.log("\n🎓 Complete reset finished!");
    console.log("👤 Users kept: ✓");
    console.log("📚 Courses kept: ✓");
    console.log("🏆 Badges definitions kept: ✓");
    console.log("\n⚠️  IMPORTANT: Clear browser localStorage:");
    console.log("   - Open DevTools (F12)");
    console.log("   - Go to Application > Storage > Local Storage");
    console.log("   - Clear all items OR logout and login again\n");
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error clearing progress:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

clearAllProgress();

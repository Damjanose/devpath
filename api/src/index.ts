import app from "./app";
import { config } from "./config";
import prisma from "./lib/prisma";

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(config.port, () => {
      console.log(`🚀 DevPath API running on http://localhost:${config.port}`);
      console.log(`📋 Health check: http://localhost:${config.port}/health`);
      console.log(`🔑 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

main();

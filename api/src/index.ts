import app from "./app";
import { config } from "./config";
import prisma from "./lib/prisma";

async function main() {
  // Validate env early so deployment issues fail with actionable messages.
  config.databaseUrl;

  if (config.nodeEnv === "production") {
    try {
      await prisma.$connect();
      console.log("✅ Database connected");
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  } else {
    // In local dev we keep the API booting even if DB is not reachable yet.
    prisma
      .$connect()
      .then(() => console.log("✅ Database connected"))
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Unknown database connection error";
        console.warn(`⚠️ Database unavailable in development: ${message}`);
      });
  }

  app.listen(config.port, () => {
    console.log(`🚀 DevPath API running on http://localhost:${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/health`);
    console.log(`🔑 Environment: ${config.nodeEnv}`);
  });
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

import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const isDev = process.env.NODE_ENV === "development";
  return new PrismaClient({
    log: isDev ? ["warn", "error"] : ["error"],
  });
}

const prisma = createPrismaClient();

export default prisma;

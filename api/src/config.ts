import dotenv from "dotenv";
dotenv.config();

function normalizeDatabaseUrl(rawUrl: string): string {
  const databaseUrl = rawUrl.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is empty");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  if (!["postgresql:", "postgres:"].includes(parsedUrl.protocol)) {
    throw new Error("DATABASE_URL must start with postgresql:// or postgres://");
  }

  if (!parsedUrl.hostname) {
    throw new Error("DATABASE_URL host is missing");
  }

  // Guard against accidentally pasting labels or malformed user/tenant fragments.
  if (parsedUrl.hostname.includes("/") || parsedUrl.hostname.includes(" ")) {
    throw new Error("DATABASE_URL host is malformed");
  }

  if (!parsedUrl.pathname || parsedUrl.pathname === "/") {
    throw new Error("DATABASE_URL database name is missing");
  }

  return databaseUrl;
}

function getPort(): number {
  const envPort = process.env.PORT;
  if (envPort) {
    const parsed = Number(envPort);
    if (!isNaN(parsed)) return parsed;
  }
  return 3001;
}

export const config = {
  get port() {
    return getPort();
  },
  get nodeEnv() {
    return process.env.NODE_ENV || "development";
  },
  get jwtSecret() {
    return process.env.JWT_SECRET || "devpath-jwt-secret";
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || "7d";
  },
  get corsOrigin() {
    return process.env.CORS_ORIGIN || "http://localhost:8080";
  },
  get databaseUrl() {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      throw new Error("DATABASE_URL is not set");
    }

    return normalizeDatabaseUrl(raw);
  },
  get isDev() {
    return process.env.NODE_ENV !== "production";
  },
};

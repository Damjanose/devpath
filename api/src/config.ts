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

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
}

const DEV_JWT_SECRET = "devpath-jwt-secret";

export const config = {
  get port() {
    return getPort();
  },
  get nodeEnv() {
    return process.env.NODE_ENV || "development";
  },
  get jwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (secret) {
      return secret;
    }

    if (this.nodeEnv === "production") {
      throw new Error("JWT_SECRET is not set");
    }

    return DEV_JWT_SECRET;
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || "7d";
  },
  get corsOrigins() {
    const raw = process.env.CORS_ORIGIN || "http://localhost:8080";
    return raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  },
  isCorsOriginAllowed(origin: string | undefined) {
    if (!origin) {
      return true;
    }

    const allowedOrigins = this.corsOrigins;
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    if (
      allowedOrigins.includes("*.vercel.app") &&
      /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(origin)
    ) {
      return true;
    }

    return false;
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
  get serveFrontend() {
    return parseBooleanEnv(process.env.SERVE_FRONTEND, false);
  },
  validateProductionEnv() {
    if (this.nodeEnv !== "production") {
      return;
    }

    this.jwtSecret;

    if (this.corsOrigins.every((origin) => origin.includes("localhost"))) {
      throw new Error("CORS_ORIGIN must include your production frontend URL");
    }
  },
};

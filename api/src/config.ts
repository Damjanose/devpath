import dotenv from "dotenv";
dotenv.config();

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
  get isDev() {
    return process.env.NODE_ENV !== "production";
  },
};

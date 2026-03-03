import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { config } from "../config";
import { ApiError } from "../lib/ApiError";
import { AuthPayload } from "../types";

function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const authService = {
  async register(email: string, password: string, displayName: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            displayName,
          },
        },
        roles: {
          create: { role: "user" },
        },
      },
      include: { profile: true },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile?.displayName,
        totalPoints: user.profile?.totalPoints ?? 0,
        level: user.profile?.level ?? 1,
      },
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, roles: true },
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile?.displayName,
        totalPoints: user.profile?.totalPoints ?? 0,
        level: user.profile?.level ?? 1,
        roles: user.roles.map((r) => r.role),
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, roles: true },
    });

    if (!user) throw ApiError.notFound("User not found");

    return {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName,
      avatarUrl: user.profile?.avatarUrl,
      bio: user.profile?.bio,
      totalPoints: user.profile?.totalPoints ?? 0,
      level: user.profile?.level ?? 1,
      roles: user.roles.map((r) => r.role),
    };
  },
};

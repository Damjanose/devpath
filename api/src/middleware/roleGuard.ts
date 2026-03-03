import { Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../types";
import { ApiError } from "../lib/ApiError";

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.userId },
        select: { role: true },
      });

      const userRoleNames = userRoles.map((r) => r.role);
      const hasRole = roles.some((role) => userRoleNames.includes(role as any));

      if (!hasRole) {
        throw ApiError.forbidden("Insufficient permissions");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt"; // JWT verification utility
import prisma from "../lib/prisma";
import { toPermissionString } from "../lib/helpers";
import { JWTPayload } from "jose";

// Middleware to check if the user is authenticated
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = await verifyToken(token);
    const keycloakId = payload.sub;

    if (!keycloakId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await syncUser(payload);

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: { permissions: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();

    fullUser?.userRoles.forEach((ur) => {
      ur.role.permissions.forEach((p) => {
        permissions.add(toPermissionString(p.action, p.entity));
      });
    });

    req.user = payload as {
      sub: string;
      email: string;
      preferred_username: string;
      name: string;
    };
    req.permissions = Array.from(permissions);

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid token");
  }
};

async function syncUser(payload: JWTPayload) {
  const keycloakId = payload.sub as string;

  return prisma.user.upsert({
    where: { id: keycloakId },
    update: {},
    create: {
      id: keycloakId,
    },
  });
}

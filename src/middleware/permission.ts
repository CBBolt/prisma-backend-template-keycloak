import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

//Middleware to verify current user has proper permissions
const checkPermission = (entity: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const permissionCount = await prisma.userRoles.count({
      where: {
        userId,
        role: {
          permissions: {
            some: {
              entity,
              action,
            },
          },
        },
      },
    });

    if (permissionCount === 0) {
      return res.status(403).json({
        message: "Forbidden: You don't have the required permission",
      });
    }

    next();
  };
};

export default checkPermission;

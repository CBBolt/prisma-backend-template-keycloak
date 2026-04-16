import express, { Request, Response } from "express";
import prisma from "../lib/prisma";
import { toPermissionString } from "../lib/helpers";

const router = express.Router();

router.get("/profile", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      // If there's no userId, return a 401 Unauthorized response
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      // If user is not found, return a 404 response
      return res.status(404).json({ message: "User not found" });
    }

    // Create a permissions set to avoid duplicates
    const permissionsSet = new Set<string>();

    user.userRoles.forEach((ur) => {
      ur.role.permissions.forEach((perm) => {
        const permission = toPermissionString(perm.action, perm.entity);
        permissionsSet.add(permission);
      });
    });

    // Convert the set into an array
    const permissions = Array.from(permissionsSet);

    // Send the response with user details and permissions
    return res.status(200).json({
      user: req.user,
      roles: user.userRoles.map((ur) => ur.role.name),
      permissions,
    });
  } catch (error) {
    console.error("Profile error:", error);
    // If there's an error during processing, return a 500 response
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

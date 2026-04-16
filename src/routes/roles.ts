import { Router } from "express";
import prisma from "../lib/prisma";
import checkPermission from "../middleware/permission";
import { toPermissionString } from "../lib/helpers";

const router = Router();

// #region Roles

router.get("/", checkPermission("role", "read"), async (_req, res) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
    },
  });

  res.json(roles);
});

router.get("/:roleId", checkPermission("role", "read"), async (req, res) => {
  const roleId = req.params.roleId;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  res.json(role);
});

router.post("/", checkPermission("role", "create"), async (req, res) => {
  const { name } = req.body;

  const role = await prisma.role.create({
    data: { name },
  });

  res.status(201).json(role);
});

router.patch(
  "/:roleId",
  checkPermission("role", "update"),
  async (req, res) => {
    const roleId = req.params.roleId;
    const { name } = req.body;

    const data = Object.fromEntries(
      Object.entries({ name }).filter(([, v]) => v !== undefined),
    );

    const role = await prisma.role.update({
      where: { id: roleId },
      data,
    });

    res.json(role);
  },
);

router.delete(
  "/:roleId",
  checkPermission("role", "delete"),
  async (req, res) => {
    const roleId = req.params.roleId;

    await prisma.role.delete({
      where: { id: roleId },
    });

    res.status(204).send();
  },
);

// #endregion

// #region Role Permissions

router.get(
  "/:roleId/permissions",
  checkPermission("role", "read"),
  async (req, res) => {
    const roleId = req.params.roleId;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role.permissions);
  },
);

router.put(
  "/:roleId/permissions",
  checkPermission("role", "manage"),
  async (req, res) => {
    const roleId = req.params.roleId;
    const { permissionIds } = req.body;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id: string) => ({ id })),
        },
      },
      include: { permissions: true },
    });

    res.json(role);
  },
);

router.post(
  "/:roleId/permissions",
  checkPermission("role", "manage"),
  async (req, res) => {
    const roleId = req.params.roleId;
    const { permissionIds } = req.body;

    if (!permissionIds) return;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id: string) => ({ id })),
        },
      },
      include: { permissions: true },
    });

    res.json(role);
  },
);

router.delete(
  "/:roleId/permissions",
  checkPermission("role", "manage"),
  async (req, res) => {
    const roleId = req.params.roleId;
    const { permissionIds } = req.body;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: permissionIds,
        },
      },
      include: { permissions: true },
    });

    res.json(role);
  },
);

// #endregion

// #region User Roles

router.get(
  "/user/:userId",
  checkPermission("user-role", "read"),
  async (req, res) => {
    const userId = req.params.userId;

    const roles = await prisma.userRoles.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    res.json(roles.map((r) => r.role));
  },
);

router.get(
  "/user/:userId/permissions",
  checkPermission("user-role", "read"),
  async (req, res) => {
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const permissions = new Set<string>();

    user.userRoles.forEach((ur) => {
      ur.role.permissions.forEach((p) => {
        const permission = toPermissionString(p.action, p.entity);
        permissions.add(permission);
      });
    });

    res.json(Array.from(permissions));
  },
);

router.post(
  "/user/:userId",
  checkPermission("user-role", "create"),
  async (req, res) => {
    const userId = req.params.userId;
    const { roleIds } = req.body;

    if (!Array.isArray(roleIds)) {
      return res.status(400).json({ message: "roleIds must be an array" });
    }

    const assignments = await prisma.userRoles.createMany({
      data: roleIds.map((roleId: string) => ({
        userId,
        roleId,
      })),
      skipDuplicates: true,
    });

    res.status(201).json(assignments);
  },
);

router.put(
  "/user/:userId",
  checkPermission("user-role", "update"),
  async (req, res) => {
    const userId = req.params.userId;
    const { roleIds } = req.body;

    if (!Array.isArray(roleIds)) {
      return res.status(400).json({ message: "roleIds must be an array" });
    }

    await prisma.userRoles.deleteMany({
      where: { userId },
    });

    await prisma.userRoles.createMany({
      data: roleIds.map((roleId: string) => ({
        userId,
        roleId,
      })),
    });

    res.status(200).json({ userId, roleIds });
  },
);

router.delete(
  "/user/:userId/role/:roleId",
  checkPermission("user-role", "delete"),
  async (req, res) => {
    const userId = req.params.userId;
    const roleId = req.params.roleId;

    await prisma.userRoles.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    res.status(204).send();
  },
);

// #endregion

export default router;

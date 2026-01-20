import { Router } from "express";
import prisma from "../lib/prisma";
import checkPermission from "../middleware/permission";

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
    const roleId = Number(req.params.roleId);
    const { name } = req.body;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: { name },
    });

    res.json(role);
  },
);

router.delete(
  "/:roleId",
  checkPermission("role", "delete"),
  async (req, res) => {
    const roleId = Number(req.params.roleId);

    await prisma.role.delete({
      where: { id: roleId },
    });

    res.status(204).send();
  },
);

// #endregion

// #region Role Permissions

router.put(
  "/:roleId/permissions",
  checkPermission("role", "manage"),
  async (req, res) => {
    const roleId = Number(req.params.roleId);
    const { permissionIds } = req.body; // number[]

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id: number) => ({ id })),
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
    const roleId = Number(req.params.roleId);
    const { permissionIds } = req.body;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id: number) => ({ id })),
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
    const roleId = Number(req.params.roleId);
    const { permissionIds } = req.body;

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: permissionIds.map((id: number) => ({ id })),
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
    const userId = Number(req.params.userId);

    const roles = await prisma.userRoles.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    res.json(roles);
  },
);

router.post(
  "/user/:userId",
  checkPermission("user-role", "create"),
  async (req, res) => {
    const userId = Number(req.params.userId);
    const { roleIds } = req.body;

    const assignments = await prisma.userRoles.createMany({
      data: roleIds.map((roleId: number) => ({
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
    const userId = Number(req.params.userId);
    const { roleIds } = req.body;

    await prisma.userRoles.deleteMany({
      where: { userId },
    });

    await prisma.userRoles.createMany({
      data: roleIds.map((roleId: number) => ({
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
    const userId = Number(req.params.userId);
    const roleId = Number(req.params.roleId);

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

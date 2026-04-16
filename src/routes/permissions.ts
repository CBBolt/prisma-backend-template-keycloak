import { Router } from "express";
import prisma from "../lib/prisma";
import checkPermission from "../middleware/permission";

const router = Router();

router.get("/", checkPermission("permission", "read"), async (_req, res) => {
  const permissions = await prisma.permission.findMany();
  res.json(permissions);
});

router.post("/", checkPermission("permission", "create"), async (req, res) => {
  const { action, entity } = req.body;

  const permission = await prisma.permission.create({
    data: { action, entity },
  });

  res.status(201).json(permission);
});

router.patch(
  "/:id",
  checkPermission("permission", "update"),
  async (req, res) => {
    const permissionId = req.params.id;
    const { action, entity } = req.body;

    const data = Object.fromEntries(
      Object.entries({ action, entity }).filter(([, v]) => v !== undefined),
    );

    try {
      const updatedPermission = await prisma.permission.update({
        where: { id: permissionId },
        data,
      });

      res.json(updatedPermission);
    } catch (error) {
      console.error("Permission: ", error);
      res.status(500).json({ error: "Failed to update permission" });
    }
  },
);

router.delete(
  "/:id",
  checkPermission("permission", "delete"),
  async (req, res) => {
    const permissionId = req.params.id;

    try {
      await prisma.permission.delete({
        where: { id: permissionId },
      });

      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: "Permission not found" });
    }
  },
);

export default router;

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
    const permissionId = Number(req.params.id);
    const { action, entity } = req.body;

    try {
      // First, get the current permission to check what the current values are
      const currentPermission = await prisma.permission.findUnique({
        where: { id: permissionId },
      });

      // If permission doesn't exist, return a 404
      if (!currentPermission) {
        return res.status(404).json({ error: "Permission not found" });
      }

      // Prepare the data to update based on provided values (keeping existing values for non-specified fields)
      const updatedPermission = await prisma.permission.update({
        where: { id: permissionId },
        data: {
          action: action || currentPermission.action, // Use the current value if not provided
          entity: entity || currentPermission.entity, // Use the current value if not provided
        },
      });

      res.json(updatedPermission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update permission" });
    }
  },
);

router.delete(
  "/:id",
  checkPermission("permission", "delete"),
  async (req, res) => {
    const permissionId = Number(req.params.id);

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

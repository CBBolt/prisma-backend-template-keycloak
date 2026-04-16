import { Router } from "express";
import prisma from "../lib/prisma";
import checkPermission from "../middleware/permission";
import { asyncHandler } from "../middleware/asyncHandler";
import { userService } from "../services/keycloak/userService";
import { roleService } from "../services/keycloak/roleService";

const router = Router();

// #region Users

router.get(
  "/",
  checkPermission("user", "read"),
  asyncHandler(async (_req, res) => {
    const users = await userService.getUsers();
    res.json(users);
  }),
);

router.post(
  "/",
  checkPermission("user", "create"),
  asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);

    //Ensure that user is also created in DB
    await prisma.user.create({ data: { id: (user as { id: string }).id } });

    res.status(201).json(user);
  }),
);

router.patch(
  "/:id",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.json(updated ?? { success: true });
  }),
);

router.delete(
  "/:id",
  checkPermission("user", "delete"),
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  }),
);

router.post(
  "/:id/disable",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    await userService.disableUser(req.params.id);
    res.json({ success: true });
  }),
);

router.post(
  "/:id/enable",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    await userService.enableUser(req.params.id);
    res.json({ success: true });
  }),
);

router.post(
  "/:id/logout",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    await userService.logoutUser(req.params.id);
    res.json({ success: true });
  }),
);

// #endregion

// #region Password

router.post(
  "/:id/set-password",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    const { password, temporary } = req.body;

    await userService.setPassword({
      userId: req.params.id,
      password,
      temporary,
    });

    res.json({ success: true });
  }),
);

// Reset password email
router.post(
  "/:id/reset-password",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    await userService.sendResetPasswordEmail(req.params.id);
    res.json({ success: true });
  }),
);

// #endregion

// User Sessions
router.get(
  "/:id/sessions",
  checkPermission("user", "read"),
  asyncHandler(async (req, res) => {
    const sessions = await userService.getUserSessions(req.params.id);
    res.json(sessions);
  }),
);

// #region Keycloak Roles
// Note: Different from RBAC

router.get(
  "/:id/roles",
  checkPermission("user", "read"),
  asyncHandler(async (req, res) => {
    const roles = await roleService.getUserRoles(req.params.id);
    res.json(roles);
  }),
);

router.post(
  "/:id/roles",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    const { roleId, roleName } = req.body;

    await roleService.assignRealmRole({
      userId: req.params.id,
      roleId,
      roleName,
    });

    res.json({ success: true });
  }),
);

router.delete(
  "/:id/roles",
  checkPermission("user", "update"),
  asyncHandler(async (req, res) => {
    const { roleId, roleName } = req.body;

    await roleService.removeRealmRole({
      userId: req.params.id,
      roleId,
      roleName,
    });

    res.json({ success: true });
  }),
);

// #endregion

export default router;

import { Request, Response, NextFunction } from "express";
import { toPermissionString } from "../lib/helpers";

//Middleware to verify current user has proper permissions
const checkPermission = (entity: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!req.permissions) {
      return res.status(500).json({
        message: "Permissions not loaded",
      });
    }

    const permission = toPermissionString(action, entity);
    if (!req.permissions || !req.permissions.includes(permission)) {
      return res.status(403).send("Forbidden");
    }

    next();
  };
};

export default checkPermission;

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt"; // JWT verification utility

// Middleware to check if the user is authenticated
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Attach user information to the request
  req.userId = decoded.userId;

  next();
};

import express, { Request, Response } from "express";
import prisma from "../lib/prisma";

import { hashPassword } from "../utils/auth";
import { verifyToken } from "../utils/jwt";

const router = express.Router();

router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  // Verify the token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // Find the user by ID from the decoded token
  const user = await prisma.user.findUnique({ where: { id: decoded!.userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Hash the new password
  try {
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

// Route to initiate the password reset flow (usually triggered by the user clicking the reset link)
router.get("/reset-password", async (req: Request, res: Response) => {
  const { token } = req.query; // Get token from the URL (query parameter)

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Verify the reset token
    const decoded = verifyToken(token as string);

    const user = await prisma.user.findUnique({
      where: { id: decoded!.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Render a password reset form or prompt for the new password (send back a response)
    return res
      .status(200)
      .json({ message: "Token is valid. Proceed to reset your password." });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
});

export default router;

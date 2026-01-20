import express, { Request, Response } from "express";
import prisma from "../lib/prisma";

import { comparePassword, hashPassword } from "../utils/auth";

const router = express.Router();

router.get("/profile", (req: Request, res: Response) => {
  res.status(200).json({ message: "Access granted", userId: req.userId });
});

router.post("/change-password", async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Ensure both current and new passwords are provided
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Please provide both current and new passwords" });
  }

  // Find the user based on the userId stored in the token
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Compare current password with stored password
  const isPasswordCorrect = await comparePassword(
    currentPassword,
    user.password,
  );

  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  // Hash the new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update the password in the database
  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashedNewPassword },
  });

  return res.status(200).json({ message: "Password updated successfully" });
});

export default router;

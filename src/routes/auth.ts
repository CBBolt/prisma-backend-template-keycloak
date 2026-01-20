import express, { Request, Response } from "express";
import prisma from "../lib/prisma";
import nodemailer from "nodemailer";

import { hashPassword, comparePassword } from "../utils/auth";
import { createToken } from "../utils/jwt";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash the password before saving to DB
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Create JWT token
  const token = createToken(user.id);

  res.status(200).json({ token });
});

// ====== Demo Nodemailer Settings =======

// Reset Password Via Email
// Create a transport for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // use your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/reset-password-request", async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res
      .status(400)
      .json({ error: "User with this email does not exist" });
  }

  // Generate a reset token
  const resetToken = createToken(user.id);

  //Points to resetPassword endpoint
  const resetUrl = `http://localhost:4000/reset-password?token=${resetToken}`;

  // Send reset email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `To reset your password, please click on the following link: ${resetUrl}`,
    });
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send reset email" });
  }
});

export default router;

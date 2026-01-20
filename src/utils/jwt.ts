import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string; // Get JWT secret from env

// Create JWT Token
export const createToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" }); // Token expires in 1 hour
};

// Verify JWT Token
export const verifyToken = (token: string): { userId: number } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    return null; // Token is invalid or expired
  }
};

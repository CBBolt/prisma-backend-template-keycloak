declare global {
  namespace Express {
    interface Request {
      userId?: number; // Add userId to Request type (optional)
    }
  }
}

export {};

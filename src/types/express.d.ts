declare global {
  namespace Express {
    interface Request {
      user: {
        sub: string;
        email: string;
        preferred_username: string;
        name: string;
      };
      permissions: string[];
    }
  }
}

export {};

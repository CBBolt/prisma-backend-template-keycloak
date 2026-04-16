import express, { NextFunction, Response, Request } from "express";
import dotenv from "dotenv";
import cors from "cors";

import permissions from "./routes/permissions";
import roles from "./routes/roles";

// import authRoutes from "./routes/auth";
import users from "./routes/users";
import images from "./routes/images";
import posts from "./routes/posts";
import keycloak from "./routes/keycloak";

import { authenticate } from "./middleware/auth";

dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://yourfrontenddomain.com",
];

// Enable CORS for specific origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin!) || !origin) {
        // Allow requests with no origin (e.g., mobile apps or Postman)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Roles / Permission Routes
app.use("/roles", authenticate, roles);
app.use("/permissions", authenticate, permissions);

app.use("/images", images);
app.use("/posts", authenticate, posts);

app.use("/keycloak", authenticate, keycloak);

//Route to get users profile and change password
app.use("/users", authenticate, users);

// Middleware to catch unhandled errors globally
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Handle unsupported methods with a generic error message
app.use((req: Request, res: Response) => {
  console.error(`Unsupported method ${req.method} on route ${req.originalUrl}`);
  res.status(405).json({
    error: "The requested action is not permitted on this resource.",
  });
});

// Global catch-all route for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from "express";
import checkPermission from "../middleware/permission";

const router = express.Router();

// Note: This is just a dummy route to simulate permissions

// Example route to view a post (read action)
router.get("/:id", checkPermission("post", "read"), (req, res) => {
  res.send("Viewing the post");
});

// Example route to create a post (create action)
router.post("/", checkPermission("post", "create"), (req, res) => {
  res.send("Creating a new post");
});

// Example route to edit a post (update action)
router.patch("/:id", checkPermission("post", "update"), (req, res) => {
  res.send("Editing the post");
});

// Example route to delete a post (delete action)
router.delete("/:id", checkPermission("post", "delete"), (req, res) => {
  res.send("Deleting the post");
});

export default router;

import express from "express";
import prisma from "../lib/prisma";
import checkPermission from "../middleware/permission";

const router = express.Router();

// GET all posts
router.get("/", checkPermission("post", "read"), async (_req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET single post
router.get("/:id", checkPermission("post", "read"), async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// CREATE post
router.post("/", checkPermission("post", "create"), async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await prisma.post.create({
      data: { title, content },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// UPDATE post
router.patch("/:id", checkPermission("post", "update"), async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;

  const data = Object.fromEntries(
    Object.entries({ title, content }).filter(([, v]) => v !== undefined),
  );

  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data,
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE post
router.delete("/:id", checkPermission("post", "delete"), async (req, res) => {
  const postId = req.params.id;

  try {
    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "Post not found" });
  }
});

export default router;

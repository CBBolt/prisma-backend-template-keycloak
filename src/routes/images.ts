import { Router } from "express";
import multer from "multer";
import { s3 } from "../services/minio";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const command = new GetObjectCommand({
      Bucket: "images",
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.json({ imageUrl: signedUrl });
  } catch (err) {
    console.error("Signed URL error:", err);
    return res.status(500).json({ error: "Could not generate signed URL" });
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const file = req.file;
  const key = `${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: "images",
    Key: key,
    Body: file.buffer,
    ACL: "public-read", // still works for MinIO if configured
    ContentType: file.mimetype,
  });

  try {
    await s3.send(command);

    const url = `${process.env.MINIO_URL}/images/${key}`;

    return res.status(200).json({
      message: "Upload successful",
      key,
      url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

router.delete("/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const command = new DeleteObjectCommand({
      Bucket: "images",
      Key: key,
    });

    await s3.send(command);

    return res.status(200).json({ message: `Deleted ${key} successfully` });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Failed to delete the image" });
  }
});

export default router;

import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const s3 = new S3Client({
  endpoint: `${process.env.MINIO_URL}`,
  region: "us-east-1", // required by v3, but MinIO accepts anything
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER!,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD!,
  },
  forcePathStyle: true, // crucial for MinIO
});

const bucketName = "images";

// Wait to ensure that minio server comes online before connecting
// Note: Railway specific to ensure deployment doesn't crash
async function ensureBucketExists(retries = 5, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Try checking if the bucket exists
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log("Bucket already exists");
    } catch (err: any) {
      // If bucket not found, try creating it
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        try {
          await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
          console.log("Bucket created successfully");
          return;
        } catch (createErr) {
          console.error("Error creating bucket:", createErr);
          throw createErr;
        }
      }

      if (attempt < retries) {
        console.warn(
          `Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`,
        );
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      } else {
        console.error("Max retries reached. Error checking bucket:", err);
        throw err;
      }
    }
  }
}

ensureBucketExists();

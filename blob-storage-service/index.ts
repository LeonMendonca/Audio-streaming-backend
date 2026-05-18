import express from "express";
import type { Request, Response } from "express";
import { Pool } from "pg";
import { verifySignedUrl } from "./middleware/verify-signed-url";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { randomUUID } from "node:crypto";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 } // 3 MB limit
});

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "Blob Storage Service",
    version: "1.0.0",
    message: "Welcome to the Blob Storage Service API"
  });
});

app.get(
  "/stream/:key",
  verifySignedUrl,
  async (req, res) => {
    const key = req.params.key;
    const blob = await db.query(
      "SELECT * FROM blobs WHERE key = $1",
      [key]
    );

    if (!blob.rows.length) {
      return res.sendStatus(404);
    }

    const audio = blob.rows[0];

    res.setHeader(
      "Content-Type",
      "audio/aac"
    );

    res.send(audio.data);
  }
);

app.post(
  "/upload",
  upload.single("audio"),
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const tempDir = os.tmpdir();
      const inputFilename = randomUUID();
      const inputPath = path.join(tempDir, inputFilename);

      await fsPromises.writeFile(inputPath, req.file.buffer);

      const variants = [
        { quality: "saver", bitrate: "64k" },
        { quality: "standard", bitrate: "128k" },
        { quality: "enhanced", bitrate: "320k" }
      ];

      const trackId = randomUUID();

      const processVariant = (variant: typeof variants[0]): Promise<void> => {
        return new Promise((resolve, reject) => {
          const outputPath = path.join(tempDir, `${inputFilename}_${variant.bitrate}.aac`);
          ffmpeg(inputPath)
            .audioCodec('aac')
            .audioBitrate(variant.bitrate)
            .format('adts')
            .save(outputPath)
            .on('end', async () => {
              try {
                const audioData = await fsPromises.readFile(outputPath);
                const key = `${trackId}-${variant.quality}`;
                await db.query(`
                  INSERT INTO blobs (key, data)
                  VALUES ($1, $2)
                `, [key, audioData]);
                await fsPromises.unlink(outputPath).catch(() => { });
                resolve();
              } catch (err) {
                reject(err);
              }
            })
            .on('error', (err) => {
              reject(err);
            });
        });
      };

      await Promise.all(variants.map((v) => processVariant(v)));
      await fsPromises.unlink(inputPath).catch(() => { });

      res.status(201).json({
        message: "Audio processed successfully",
        trackId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process audio" });
    }
  }
);

const server = app.listen(port, () => {
  console.log(`Blob Storage Service running at http://localhost:${port}`);
});

const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await db.end();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error during database shutdown:", err);
    }
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
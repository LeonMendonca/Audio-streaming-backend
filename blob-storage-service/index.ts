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
import * as mm from "music-metadata";

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
    const range = req.headers.range;

    const sizeResult = await db.query(`
      SELECT OCTET_LENGTH(data)::bigint as size FROM blobs WHERE key = $1
    `, [key]);

    if (!sizeResult.rows.length) {
      return res.sendStatus(404);
    }

    const fileSize = parseInt(sizeResult.rows[0].size, 10);

    if (typeof range === "string") {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0] || "0", 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
        return;
      }

      const chunkSize = (end - start) + 1;

      const blob = await db.query(
        "SELECT SUBSTRING(data FROM $2::int FOR $3::int) as data FROM blobs WHERE key = $1",
        [key, start + 1, chunkSize] // Postgres substring is 1-indexed
      );

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mp4",
      });
      res.end(blob.rows[0].data);
    } else {
      res.status(400).send("Requires Range header");
    }
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

      let durationInSeconds = 0;
      try {
        const metadata = await mm.parseBuffer(req.file.buffer, req.file.mimetype);
        if (metadata.format.duration) {
          durationInSeconds = metadata.format.duration;
        }
      } catch (err) {
        console.error("Could not parse audio metadata for duration", err);
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

      const trackId = req.body.trackId;

      if (!trackId) {
        return res.status(400).json({ error: "Track ID is required" });
      }

      const processVariant = (variant: typeof variants[0]): Promise<void> => {
        return new Promise((resolve, reject) => {
          const outputPath = path.join(tempDir, `${inputFilename}_${variant.bitrate}.m4a`);
          ffmpeg(inputPath)
            .audioCodec('aac')
            .audioBitrate(variant.bitrate)
            .format('mp4')
            .outputOptions('-movflags +faststart')
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

      const variantDetails = variants.map(v => ({
        quality: v.quality,
        bitrate: v.bitrate,
        key: `${trackId}-${v.quality}`
      }));

      res.status(201).json({
        message: "Audio processed successfully",
        trackId,
        duration: durationInSeconds,
        variants: variantDetails
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
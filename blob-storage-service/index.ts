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
import { insertIntoDb } from "./utils/insert-audio";
import { processAudioVariants } from "./utils/process-variants";
import { variants } from "./constants/audio.constants.variants";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 } // 3 MB limit
});

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

db.on('connect', () => {
  console.log('Database connected');
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

app.get("/health/db", async (req: Request, res: Response): Promise<any> => {
  try {
    const dbCheckPromise = db.query(`
      SELECT 
        current_database() as database,
        version() as postgres_version,
        (SELECT sum(numbackends) FROM pg_stat_database) as active_connections
    `);

    // 5-second graceful timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    );

    const result = await Promise.race([dbCheckPromise, timeoutPromise]) as any;

    const dbStats = result.rows[0];

    res.status(200).json({
      status: "connected",
      pool: {
        totalCount: db.totalCount,
        idleCount: db.idleCount,
        waitingCount: db.waitingCount
      },
      system: {
        database: dbStats.database,
        version: dbStats.postgres_version,
        active_connections: parseInt(dbStats.active_connections, 10) || 0
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: "disconnected",
      error: error.message || "Unknown database error",
      pool: {
        totalCount: db.totalCount,
        idleCount: db.idleCount,
        waitingCount: db.waitingCount
      }
    });
  }
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

interface FileDetails {
  fileName: string;
  trackId: string;
}

app.post(
  "/upload",
  upload.array("audio"),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { audio_metadata } = req.body;
      const fileDetailsBody: FileDetails[] = JSON.parse(audio_metadata);

      const fileDetailsMap = new Map<string, string>(
        fileDetailsBody.map(fd => [fd.fileName, fd.trackId])
      );

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No audio file provided" });
      }
      const tempDir = os.tmpdir();

      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const inputPath = path.join(tempDir, randomUUID());
          await fsPromises.writeFile(inputPath, file.buffer);

          return {
            fileName: file.originalname,
            inputPath,
            trackId: fileDetailsMap.get(file.originalname)!
          };
        })
      );

      await Promise.all(fileDetails.map(async (fd) => {
        console.time("processing variant " + fd.trackId);
        const audioDetails = await Promise.all(
          variants.map((v, idx) => processAudioVariants(tempDir, v, fd.trackId, fd.inputPath, idx + 1))
        );
        console.timeEnd("processing variant " + fd.trackId);
        await insertIntoDb(audioDetails, db);
      }));

      const variantDetails = variants.map(v => ({
        quality: v.quality,
        bitrate: v.bitrate,
      }));

      res.status(201).json({
        message: "Audio processed successfully",
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
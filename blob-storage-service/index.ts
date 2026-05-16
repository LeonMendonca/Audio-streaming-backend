import express from "express";
import type { Request, Response } from "express";
import { Pool } from "pg";
import { verifySignedUrl } from "./middleware/verify-signed-url";

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
  "/stream/:id",
  verifySignedUrl,
  async (req, res) => {
    const track = await db.query(
      "SELECT * FROM tracks WHERE id = $1",
      [req.params.id]
    );

    if (!track.rows.length) {
      return res.sendStatus(404);
    }

    const audio = track.rows[0];

    res.setHeader(
      "Content-Type",
      audio.mime_type
    );

    res.send(audio.audio_data);
  }
);

const server = app.listen(port, () => {
  console.log(`🚀 Blob Storage Service running at http://localhost:${port}`);
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
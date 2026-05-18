import { Pool } from "pg";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  try {
    console.log("Creating blobs table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS blobs (
        key TEXT PRIMARY KEY,
        data BYTEA
      );
    `);
    console.log("Created blobs table.");

  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await db.end();
  }
};

createTables();

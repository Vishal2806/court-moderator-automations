import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import pool from "./config/db.js";
import advocateRoutes from "./routes/advocates.routes.js";
import victimRoutes from "./routes/victims.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : process.env.NODE_ENV !== "production",
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const ensureAuthTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'client',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'client'
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'password_hash'
      ) THEN
        UPDATE users
        SET password = password_hash
        WHERE password IS NULL;

        ALTER TABLE users
        ALTER COLUMN password_hash DROP NOT NULL;
      END IF;
    END $$;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE password IS NULL
      ) THEN
        ALTER TABLE users
        ALTER COLUMN password SET NOT NULL;
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx
    ON users (username)
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'client'));
      END IF;
    END $$;
  `);
};

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "OK",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Health check failed" });
  }
});

app.use('/auth', authRoutes);
app.use('/advocates', authMiddleware, advocateRoutes);
app.use('/victims', authMiddleware, victimRoutes);

const startServer = async () => {
  try {
    await ensureAuthTable();
    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

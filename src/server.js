import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./db.js";
import linksRouter from "./routes/links.js";

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// 1️⃣ Serve static frontend files first
app.use(express.static(path.join(__dirname, "../public")));

// 2️⃣ API routes next
app.use("/api/links", linksRouter);

// 3️⃣ Stats page route
app.get("/code/:code", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/stats.html"));
});

// 4️⃣ Healthcheck
app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// 5️⃣ Redirect route (MUST be last)
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      "SELECT target_url FROM links WHERE code=$1",
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Not Found");
    }

    const redirectUrl = result.rows[0].target_url;

    await pool.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
      [code]
    );

    res.redirect(302, redirectUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

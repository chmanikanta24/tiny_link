import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "../db.js";
import linksRouter from "../routes/links.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Health check route (required by assignment)
app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// API routes
app.use("/api/links", linksRouter);

/*-------------------------------------------------
  REDIRECT ROUTE
  GET /:code → Redirect to original URL
--------------------------------------------------*/

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

    const target = result.rows[0].target_url;

    // Update click stats
    await pool.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
      [code]
    );

    res.redirect(302, target);
  } catch (e) {
    res.status(500).send("Server Error");
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});

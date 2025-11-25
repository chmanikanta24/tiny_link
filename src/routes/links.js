import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Utility: Check valid code format
function validateCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// Utility: Validate URL
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/*-------------------------------------------------
   CREATE SHORT LINK
  POST /api/links
--------------------------------------------------*/

router.post("/", async (req, res) => {
  const { target_url, code } = req.body;

  // Validate URL
  if (!validateURL(target_url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Validate code
  if (!validateCode(code)) {
    return res.status(400).json({ error: "Code must be 6-8 alphanumeric characters" });
  }

  try {
    // Check duplicate
    const exists = await pool.query("SELECT code FROM links WHERE code=$1", [code]);

    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "Code already exists" });
    }

    // Insert
    await pool.query(
      "INSERT INTO links (code, target_url, clicks, last_clicked) VALUES ($1, $2, 0, NULL)",
      [code, target_url]
    );

    res.json({ ok: true, code, target_url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*-------------------------------------------------
   GET ALL LINKS
  GET /api/links
--------------------------------------------------*/

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT code, target_url, clicks, last_clicked FROM links ORDER BY code"
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*-------------------------------------------------
  GET STATS OF ONE CODE
  GET /api/links/:code
--------------------------------------------------*/

router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      "SELECT code, target_url, clicks, last_clicked FROM links WHERE code=$1",
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Code not found" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*-------------------------------------------------
  DELETE SHORT LINK
  DELETE /api/links/:code
--------------------------------------------------*/

router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query("DELETE FROM links WHERE code=$1", [code]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Code not found" });
    }

    res.json({ ok: true, message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

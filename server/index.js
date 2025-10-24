import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Credentials (env) and simple in-memory session store
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "RollerMatrix!25";
const sessions = new Set();

// Login/Logout
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = crypto.randomUUID();
    sessions.add(token);
    return res.json({ token });
  }
  return res.status(401).json({ error: "invalid_credentials" });
});
app.post("/api/logout", (req, res) => {
  const t = req.headers["x-admin-token"];
  if (t) sessions.delete(t);
  res.json({ ok: true });
});

// Protect writes to matrix
const dataFile = path.resolve(__dirname, "data/matrix.json");
app.get("/api/matrix", (_req, res) => {
  try {
    if (!fs.existsSync(dataFile)) return res.json({ categories: [] });
    res.json(JSON.parse(fs.readFileSync(dataFile, "utf-8")));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/matrix", (req, res) => {
  const t = req.headers["x-admin-token"];
  if (!sessions.has(t)) return res.status(401).json({ error: "unauthorized" });
  try {
    fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Matrix API on http://localhost:${PORT}`));

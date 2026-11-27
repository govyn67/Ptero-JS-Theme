/*!
 * PteroJS Theme - Plugin Manager Backend Routes
 * Supports: Modrinth, Spigot, CurseForge
 * For ptero-js (Node.js Pterodactyl panel fork)
 */

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const PLUGIN_DIR = process.env.PLUGIN_DIR || "./plugins";

/* ===== Loader icons ===== */
const LOADER_ICONS = {
  paper: "https://cdn.modrinth.com/data/cached_images/6a2f0d7b-1b4d-4f8a-9e2c-3a8f1e2d3c4b.png",
  spigot: "https://cdn.spigotmc.org/icons/spigot.png",
  forge: "https://files.minecraftforge.net/images/logo.png",
  fabric: "https://cdn.modrinth.com/data/6s8J2H6P/icon.png",
  velocity: "https://cdn.modrinth.com/data/cached_images/velocity.png",
  bungeecord: "https://ci.spigotmc.org/images/logo.png"
};

/* ===== Modrinth API ===== */
// GET /api/plugins/modrinth/search?q=...
router.get("/modrinth/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(q)}&facets=[]`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data.hits.map(h => ({
      source: "modrinth",
      id: h.project_id,
      name: h.title,
      author: h.author,
      downloads: h.downloads,
      latestVersion: h.latest_version,
      icon: h.icon_url || ""
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/plugins/modrinth/:projectId/versions
router.get("/modrinth/:projectId/versions", async (req, res) => {
  try {
    const { projectId } = req.params;
    const url = `https://api.modrinth.com/v2/project/${projectId}/version`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data.map(v => ({
      version: v.version_number,
      build: v.build_number,
      file: v.files[0]?.filename,
      url: v.files[0]?.url,
      gameVersions: v.game_versions,
      loaders: v.loaders
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===== Spigot API ===== */
// GET /api/plugins/spigot/search?q=...
router.get("/spigot/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });
    // Spigot simple API
    const url = `https://api.spigotmc.org/simple/0.1/index.php?action=getResource&resource=${encodeURIComponent(q)}`;
    const r = await fetch(url);
    const text = await r.text();
    res.json({ source: "spigot", query: q, raw: text, icon: "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===== CurseForge API ===== */
// GET /api/plugins/curseforge/search?q=...
router.get("/curseforge/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });
    const key = process.env.CURSEFORGE_API_KEY;
    if (!key) return res.status(500).json({ error: "CurseForge API key not configured" });
    const url = `https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { "x-api-key": key } });
    const data = await r.json();
    res.json((data.data || []).map(m => ({
      source: "curseforge",
      id: m.id,
      name: m.name,
      author: m.author,
      downloads: m.downloadCount,
      latestVersion: m.latestFileName,
      icon: m.logo || ""
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===== Install Plugin (with version) ===== */
// POST /api/plugins/install
router.post("/install", async (req, res) => {
  try {
    const { source, url, fileName, serverId, version } = req.body;
    if (!url || !fileName) return res.status(400).json({ error: "url and fileName required" });
    const fs = require("fs");
    const path = require("path");
    const targetDir = path.join(PLUGIN_DIR, serverId || "global");
    fs.mkdirSync(targetDir, { recursive: true });
    const r = await fetch(url);
    const buffer = await r.buffer();
    fs.writeFileSync(path.join(targetDir, fileName), buffer);
    res.json({ success: true, path: path.join(targetDir, fileName), version: version || "latest" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===== List Installed Plugins ===== */
// GET /api/plugins/installed?serverId=...
router.get("/installed", (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const serverId = req.query.serverId;
    const dir = path.join(PLUGIN_DIR, serverId || "global");
    if (!fs.existsSync(dir)) return res.json([]);
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".jar") || f.endsWith(".zip"));
    res.json(files.map(f => ({ name: f, path: path.join(dir, f) })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

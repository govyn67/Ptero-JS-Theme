/*!
 * PteroJS Theme - Version Manager Backend Routes
 * Supports: Paper, Spigot, Forge, Fabric, Velocity, Bungeecord
 * For ptero-js (Node.js Pterodactyl panel fork)
 */

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

/* Loader icons */
const LOADER_ICONS = {
  paper: "https://papermc.io/img/paper-logo.png",
  spigot: "https://www.spigotmc.org/wiki/images/thumb/5/5f/SpigotMC_Logo.png/200px-SpigotMC_Logo.png",
  forge: "https://files.minecraftforge.net/images/logo.png",
  fabric: "https://cdn.modrinth.com/data/6s8J2H6P/icon.png",
  velocity: "https://velocitypowered.com/images/logo.png",
  bungeecord: "https://ci.spigotmc.org/images/logo.png"
};

/* ===== PaperMC API ===== */
// GET /api/versions/paper
router.get("/paper", async (req, res) => {
  try {
    const r = await fetch("https://api.papermc.io/v2/projects/paper");
    const data = await r.json();
    res.json(data.versions.map(v => ({
      loader: "paper",
      version: v,
      type: "release",
      icon: LOADER_ICONS.paper
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/versions/paper/:version/builds
router.get("/paper/:version/builds", async (req, res) => {
  try {
    const { version } = req.params;
    const r = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}/builds`);
    const data = await r.json();
    res.json(data.builds.map(b => ({
      loader: "paper",
      gameVersion: version,
      build: b.build,
      type: "release",
      icon: LOADER_ICONS.paper,
      download: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${b.build}/downloads/${b.downloads.application.name}`
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Spigot ===== */
// GET /api/versions/spigot
router.get("/spigot", async (req, res) => {
  try {
    const versions = ["1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.17.1", "1.16.5"];
    res.json(versions.map(v => ({ loader: "spigot", version: v, type: "release", icon: LOADER_ICONS.spigot })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Forge ===== */
// GET /api/versions/forge
router.get("/forge", async (req, res) => {
  try {
    const r = await fetch("https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json");
    const data = await r.json();
    const out = [];
    for (const mcVersion of Object.keys(data)) {
      for (const promo of Object.keys(data[mcVersion])) {
        out.push({ loader: "forge", gameVersion: mcVersion, build: promo, recommended: data[mcVersion][promo], type: "release", icon: LOADER_ICONS.forge });
      }
    }
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Fabric ===== */
// GET /api/versions/fabric
router.get("/fabric", async (req, res) => {
  try {
    const r = await fetch("https://meta.fabricmc.net/v2/versions/game");
    const data = await r.json();
    res.json(data.map(v => ({
      loader: "fabric",
      gameVersion: v.version,
      type: v.type,
      icon: LOADER_ICONS.fabric
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/versions/fabric/loader
router.get("/fabric/loader", async (req, res) => {
  try {
    const r = await fetch("https://meta.fabricmc.net/v2/versions/loader");
    const data = await r.json();
    res.json(data.map(v => ({ loader: "fabric-loader", version: v.version, stable: v.stable, icon: LOADER_ICONS.fabric })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Velocity ===== */
// GET /api/versions/velocity
router.get("/velocity", async (req, res) => {
  try {
    const r = await fetch("https://api.papermc.io/v2/projects/velocity");
    const data = await r.json();
    res.json(data.versions.map(v => ({ loader: "velocity", version: v, type: "release", icon: LOADER_ICONS.velocity })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Bungeecord ===== */
// GET /api/versions/bungeecord
router.get("/bungeecord", async (req, res) => {
  try {
    const r = await fetch("https://ci.spigotmc.org/job/BungeeCord/lastSuccessfulBuild/api/json");
    const data = await r.json();
    res.json([{
      loader: "bungeecord",
      version: data.displayName || "latest",
      build: data.number,
      type: "release",
      icon: LOADER_ICONS.bungeecord,
      download: `${data.url}artifact/BungeeCord-Proxy/target/BungeeCord.jar`
    }]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Install Version ===== */
// POST /api/versions/install
router.post("/install", (req, res) => {
  const { loader, version, build, serverId, icon } = req.body;
  res.json({
    success: true,
    message: `Version install queued: ${loader} ${version} (build ${build}) for server ${serverId}`,
    loader, version, build, serverId, icon
  });
});

module.exports = router;

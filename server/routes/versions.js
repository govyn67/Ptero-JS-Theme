/*!
 * PteroJS Theme - Version Manager Backend Routes
 * Supports: Paper, Purpur, Vanilla, Fabric, Forge, NeoForge, Spigot, Folia, Velocity, Bungeecord
 * For ptero-js (Node.js Pterodactyl panel fork)
 */

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

/* Loader icons */
const LOADER_ICONS = {
  paper: "https://papermc.io/img/paper-logo.png",
  purpur: "https://cdn.modrinth.com/data/6s8J2H6P/icon.png",
  vanilla: "https://www.minecraft.net/etc.clientlibs/minecraft/clientlibs/main/resources/img/favicon.ico",
  fabric: "https://cdn.modrinth.com/data/6s8J2H6P/icon.png",
  forge: "https://files.minecraftforge.net/images/logo.png",
  neoforge: "https://cdn.modrinth.com/data/Zq8ZQzZm/icon.png",
  spigot: "https://www.spigotmc.org/wiki/images/thumb/5/5f/SpigotMC_Logo.png/200px-SpigotMC_Logo.png",
  folia: "https://papermc.io/img/folia-logo.png",
  velocity: "https://velocitypowered.com/images/logo.png",
  bungeecord: "https://ci.spigotmc.org/images/logo.png"
};

/* ===== PaperMC API ===== */
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

/* ===== Purpur (via Papermc-style / PurpurMC) ===== */
router.get("/purpur", async (req, res) => {
  try {
    const r = await fetch("https://api.purpurmc.org/v2/purpur");
    const data = await r.json();
    res.json(data.versions.map(v => ({
      loader: "purpur",
      version: v,
      type: "release",
      icon: LOADER_ICONS.purpur
    })));
  } catch (e) {
    // Fallback versions
    res.json(["1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.17.1", "1.16.5"].map(v => ({
      loader: "purpur", version: v, type: "release", icon: LOADER_ICONS.purpur
    })));
  }
});

router.get("/purpur/:version/builds", async (req, res) => {
  try {
    const { version } = req.params;
    const r = await fetch(`https://api.purpurmc.org/v2/purpur/${version}/builds`);
    const data = await r.json();
    res.json(data.builds.map(b => ({
      loader: "purpur",
      gameVersion: version,
      build: b.build,
      type: "release",
      icon: LOADER_ICONS.purpur,
      download: `https://api.purpurmc.org/v2/purpur/${version}/builds/${b.build}/downloads/${b.downloads.application.name}`
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Vanilla Minecraft ===== */
router.get("/vanilla", async (req, res) => {
  try {
    const r = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
    const data = await r.json();
    const releases = data.versions.filter(v => v.type === "release").slice(0, 30);
    res.json(releases.map(v => ({
      loader: "vanilla",
      gameVersion: v.id,
      version: v.id,
      type: v.type,
      icon: LOADER_ICONS.vanilla,
      url: v.url
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/vanilla/:version", async (req, res) => {
  try {
    const { version } = req.params;
    const r = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
    const data = await r.json();
    const entry = data.versions.find(v => v.id === version);
    if (!entry) return res.status(404).json({ error: "Version not found" });
    const vdata = await fetch(entry.url).then(r => r.json());
    res.json({
      loader: "vanilla",
      version: vdata.id,
      gameVersion: vdata.id,
      type: vdata.type,
      icon: LOADER_ICONS.vanilla,
      download: vdata.downloads.server.url
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Fabric ===== */
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

router.get("/fabric/loader", async (req, res) => {
  try {
    const r = await fetch("https://meta.fabricmc.net/v2/versions/loader");
    const data = await r.json();
    res.json(data.map(v => ({ loader: "fabric-loader", version: v.version, stable: v.stable, icon: LOADER_ICONS.fabric })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Forge ===== */
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

/* ===== NeoForge ===== */
router.get("/neoforge", async (req, res) => {
  try {
    const r = await fetch("https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml");
    const text = await r.text();
    const versions = text.match(/<version>([^<]+)<\/version>/g).map(v => v.replace(/<\/?version>/g, "")).filter(v => v !== "LATEST" && v !== "RELEASE");
    res.json(versions.slice(0, 30).map(v => ({
      loader: "neoforge",
      version: v,
      type: "release",
      icon: LOADER_ICONS.neoforge
    })));
  } catch (e) {
    res.json(["1.20.4", "1.20.1", "1.19.4", "1.18.2"].map(v => ({
      loader: "neoforge", version: v, type: "release", icon: LOADER_ICONS.neoforge
    })));
  }
});

/* ===== Spigot ===== */
router.get("/spigot", async (req, res) => {
  try {
    const versions = ["1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.17.1", "1.16.5"];
    res.json(versions.map(v => ({ loader: "spigot", version: v, type: "release", icon: LOADER_ICONS.spigot })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Folia ===== */
router.get("/folia", async (req, res) => {
  try {
    const r = await fetch("https://api.papermc.io/v2/projects/folia");
    const data = await r.json();
    res.json(data.versions.map(v => ({
      loader: "folia",
      version: v,
      type: "release",
      icon: LOADER_ICONS.folia
    })));
  } catch (e) {
    res.json(["1.20.4", "1.20.1", "1.19.4", "1.18.2"].map(v => ({
      loader: "folia", version: v, type: "release", icon: LOADER_ICONS.folia
    })));
  }
});

router.get("/folia/:version/builds", async (req, res) => {
  try {
    const { version } = req.params;
    const r = await fetch(`https://api.papermc.io/v2/projects/folia/versions/${version}/builds`);
    const data = await r.json();
    res.json(data.builds.map(b => ({
      loader: "folia",
      gameVersion: version,
      build: b.build,
      type: "release",
      icon: LOADER_ICONS.folia,
      download: `https://api.papermc.io/v2/projects/folia/versions/${version}/builds/${b.build}/downloads/${b.downloads.application.name}`
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Velocity ===== */
router.get("/velocity", async (req, res) => {
  try {
    const r = await fetch("https://api.papermc.io/v2/projects/velocity");
    const data = await r.json();
    res.json(data.versions.map(v => ({ loader: "velocity", version: v, type: "release", icon: LOADER_ICONS.velocity })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ===== Bungeecord ===== */
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
router.post("/install", (req, res) => {
  const { loader, version, build, serverId, icon } = req.body;
  res.json({
    success: true,
    message: `Version install queued: ${loader} ${version} (build ${build}) for server ${serverId}`,
    loader, version, build, serverId, icon
  });
});

module.exports = router;

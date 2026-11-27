/*!
 * PteroJS Theme - Server Entry Point
 * Mounts plugin & version manager routes for ptero-js panel
 */

const express = require("express");
const path = require("path");

const pluginRoutes = require("./routes/plugins");
const versionRoutes = require("./routes/versions");

const app = express();
app.use(express.json());

// API routes
app.use("/api/plugins", pluginRoutes);
app.use("/api/versions", versionRoutes);

// Serve static theme assets
app.use("/theme", express.static(path.join(__dirname, "..", "theme")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[PteroJS Theme] Server running on http://localhost:${PORT}`);
});

module.exports = app;

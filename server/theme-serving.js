/*!
 * PteroJS Theme - Theme Serving Middleware
 * Add this to your ptero-js main server file to serve theme assets
 * For ptero-js (Node.js Pterodactyl panel fork)
 */

const express = require("express");
const path = require("path");

/**
 * Theme serving middleware
 * Serves CSS, JS, icons from the theme directory
 * @param {Object} app - Express app instance
 * @param {String} panelDir - Path to ptero-js directory
 */
function setupThemeServing(app, panelDir) {
  const themeDir = path.join(panelDir, "theme");

  // Serve theme CSS, JS, icons statically
  app.use("/theme/css", express.static(path.join(themeDir, "css")));
  app.use("/theme/js", express.static(path.join(themeDir, "js")));
  app.use("/theme/icons", express.static(path.join(themeDir, "icons")));

  console.log("[PteroJS Theme] Theme serving enabled at /theme/");
}

module.exports = { setupThemeServing };

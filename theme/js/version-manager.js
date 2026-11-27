/*!
 * PteroJS Theme - Version Manager Frontend
 * Supports: Paper, Spigot, Forge, Fabric, Velocity, Bungeecord
 */

const VersionManager = {
  loaders: ["paper", "spigot", "forge", "fabric", "velocity", "bungeecord"],

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
    this.bindEvents();
  },

  render() {
    this.container.innerHTML = `
      <div class="pt-card pt-fade-in">
        <div class="pt-card-header">
          <div class="pt-card-title">Server Version Manager</div>
        </div>
        <div class="pt-card-body pt-mb-2">
          <div class="pt-flex pt-gap-2 pt-mb-2">
            <select id="vm-loader" class="pt-form-input pt-form-select pt-w-full">
              ${this.loaders.map(l => `<option value="${l}">${l.charAt(0).toUpperCase() + l.slice(1)}</option>`).join("")}
            </select>
            <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="VersionManager.loadVersions()">Load Versions</button>
          </div>
          <div id="vm-versions" class="pt-mt-2"></div>
          <div id="vm-install-status"></div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById("vm-loader").addEventListener("change", () => this.loadVersions());
  },

  async loadVersions() {
    const loader = document.getElementById("vm-loader").value;
    const box = document.getElementById("vm-versions");
    box.innerHTML = "<p>Loading versions...</p>";

    try {
      const r = await fetch(`/api/versions/${loader}`);
      const data = await r.json();
      this.renderVersions(data, loader);
    } catch (e) {
      box.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  },

  renderVersions(data, loader) {
    const box = document.getElementById("vm-versions");
    const items = Array.isArray(data) ? data : [];
    box.innerHTML = `
      <div class="pt-card-title">${loader.charAt(0).toUpperCase() + loader.slice(1)} Versions</div>
      <table class="pt-table pt-w-full pt-mt-2">
        <thead><tr><th>Version</th><th>Type</th><th>Action</th></tr></thead>
        <tbody>
          ${items.map(v => `
            <tr>
              <td>${v.gameVersion || v.version || v.build}</td>
              <td><span class="pt-badge pt-badge-secondary">${v.type || "release"}</span></td>
              <td>
                <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="VersionManager.install('${loader}', '${v.gameVersion || v.version || v.build}', '${v.build || ''}')">Install</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  },

  async install(loader, version, build) {
    const status = document.getElementById("vm-install-status");
    status.innerHTML = `<p>Installing ${loader} ${version}...</p>`;
    try {
      const r = await fetch("/api/versions/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loader, version, build, serverId: "global" })
      });
      const res = await r.json();
      status.innerHTML = `<p style="color:green">${res.message}</p>`;
    } catch (e) {
      status.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  }
};

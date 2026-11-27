/*!
 * PteroJS Theme - Plugin Manager Frontend
 * Supports: Modrinth, Spigot, CurseForge
 * Features: Plugin icons/logo, version selection, install
 */

const PluginManager = {
  sources: ["modrinth", "spigot", "curseforge"],

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
          <div class="pt-card-title">Plugin Manager</div>
          <div class="pt-flex pt-gap-2">
            <button class="pt-btn pt-btn-sm pt-btn-secondary" onclick="PluginManager.refresh()">Refresh</button>
          </div>
        </div>
        <div class="pt-card-body pt-mb-2">
          <div class="pt-flex pt-gap-2 pt-mb-2">
            <input type="text" id="pm-search" class="pt-form-input pt-w-full" placeholder="Search plugins (Modrinth / Spigot / CurseForge)...">
            <select id="pm-source" class="pt-form-input pt-form-select">
              <option value="modrinth">Modrinth</option>
              <option value="spigot">Spigot</option>
              <option value="curseforge">CurseForge</option>
            </select>
            <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="PluginManager.search()">Search</button>
          </div>
          <div id="pm-results" class="pt-flex pt-gap-2" style="display:flex; flex-wrap:wrap;"></div>
          <div id="pm-installed" class="pt-mt-2"></div>
          <div id="pm-version-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10000; justify-content:center; align-items:center;">
            <div style="background:var(--pt-surface); color:var(--pt-text); padding:1.5rem; border-radius:var(--pt-radius); min-width:320px; max-width:500px; border:1px solid var(--pt-border);">
              <div class="pt-card-title">Select Plugin Version</div>
              <div id="pm-version-list" class="pt-mt-2"></div>
              <button class="pt-btn pt-btn-sm pt-btn-secondary pt-w-full pt-mt-2" onclick="PluginManager.closeVersionModal()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    this.loadInstalled();
  },

  bindEvents() {
    const input = document.getElementById("pm-search");
    input.addEventListener("keypress", (e) => { if (e.key === "Enter") this.search(); });
  },

  closeVersionModal() {
    document.getElementById("pm-version-modal").style.display = "none";
    this.pendingInstall = null;
  },

  async search() {
    const q = document.getElementById("pm-search").value;
    const source = document.getElementById("pm-source").value;
    const results = document.getElementById("pm-results");
    results.innerHTML = "<p>Searching...</p>";

    try {
      const r = await fetch(`/api/plugins/${source}/search?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      this.renderResults(data);
    } catch (e) {
      results.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  },

  renderResults(data) {
    const results = document.getElementById("pm-results");
    results.innerHTML = "";
    const list = Array.isArray(data) ? data : (data.hits || []);
    list.forEach(p => {
      const iconHtml = p.icon
        ? `<img src="${p.icon}" class="pt-plugin-icon" alt="${p.name} icon" onerror="this.style.display='none'">`
        : `<div class="pt-plugin-icon-placeholder">?</div>`;
      const card = document.createElement("div");
      card.className = "pt-card pt-mb-2";
      card.style.width = "260px";
      card.innerHTML = `
        <div class="pt-card-body" style="text-align:center;">
          ${iconHtml}
          <div class="pt-card-title">${p.name}</div>
          <div class="pt-text-muted pt-mb-2">${p.author || "Unknown"} • ${p.source}</div>
          <div class="pt-text-muted pt-mb-2" style="font-size:0.75rem;">${p.downloads ? p.downloads.toLocaleString() : "0"} downloads</div>
          <button class="pt-btn pt-btn-sm pt-btn-primary pt-w-full pt-mb-2" onclick="PluginManager.openVersionPicker('${p.source}', '${p.id || p.name}', '${p.name}')">Choose Version & Install</button>
        </div>
      `;
      results.appendChild(card);
    });
  },

  async openVersionPicker(source, projectId, pluginName) {
    this.pendingInstall = { source, projectId, pluginName };
    const modal = document.getElementById("pm-version-modal");
    const list = document.getElementById("pm-version-list");
    list.innerHTML = "<p>Loading versions...</p>";
    modal.style.display = "flex";

    try {
      let versions = [];
      if (source === "modrinth") {
        const r = await fetch(`/api/plugins/modrinth/${projectId}/versions`);
        versions = await r.json();
      } else {
        // Spigot / CurseForge: single version entry
        versions = [{ version: "latest", file: `${projectId}.jar`, url: "", gameVersions: [], loaders: [] }];
      }

      list.innerHTML = versions.map(v => `
        <div class="pt-flex pt-justify-between pt-items-center pt-mb-2 pt-border-b pt-pb-2" style="border-color:var(--pt-border);">
          <div>
            <div style="font-weight:600;">${v.version}</div>
            <div style="font-size:0.75rem;color:var(--pt-text-muted);">${v.gameVersions ? v.gameVersions.join(", ") : ""} ${v.loaders ? v.loaders.join(", ") : ""}</div>
          </div>
          <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="PluginManager.confirmInstall('${v.file || projectId}', '${v.url || ""}', '${v.version || "latest"}')">Install</button>
        </div>
      `).join("");
    } catch (e) {
      list.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  },

  async confirmInstall(fileName, fileUrl, version) {
    if (!this.pendingInstall) return;
    const { source, projectId, pluginName } = this.pendingInstall;

    // For non-modrinth, build a direct download if needed
    let finalUrl = fileUrl;
    let finalFile = fileName || `${projectId}.jar`;
    if (source !== "modrinth" && !fileUrl) {
      finalUrl = `/api/plugins/${source}/download/${projectId}`;
    }

    try {
      const r = await fetch("/api/plugins/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, url: finalUrl, fileName: finalFile, serverId: "global", version })
      });
      const res = await r.json();
      this.closeVersionModal();
      if (res.success) {
        this.showToast(`Installed ${pluginName} v${version}`, "success");
        this.loadInstalled();
      } else {
        this.showToast(res.error || "Install failed", "danger");
      }
    } catch (e) {
      this.showToast(e.message, "danger");
    }
  },

  async loadInstalled() {
    try {
      const r = await fetch("/api/plugins/installed?serverId=global");
      const files = await r.json();
      const box = document.getElementById("pm-installed");
      box.innerHTML = `
        <div class="pt-card-title">Installed Plugins</div>
        <table class="pt-table pt-w-full pt-mt-2">
          <thead><tr><th>Icon</th><th>Name</th><th>Action</th></tr></thead>
          <tbody>
            ${files.map(f => `
              <tr>
                <td><div class="pt-plugin-icon-placeholder" style="width:24px;height:24px;">J</div></td>
                <td>${f.name}</td>
                <td><button class="pt-btn pt-btn-sm pt-btn-danger" onclick="PluginManager.remove('${f.name}')">Remove</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch (e) {}
  },

  async remove(name) {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await fetch(`/api/plugins/remove?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      this.showToast(`Removed ${name}`, "success");
      this.loadInstalled();
    } catch (e) {
      this.showToast(e.message, "danger");
    }
  },

  showToast(msg, type) {
    if (window.PteroTheme) window.PteroTheme.showToast(msg, type);
  }
};

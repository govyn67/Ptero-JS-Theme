/*!
 * PteroJS Theme - Plugin Manager Logic
 * Supports: Modrinth, Spigot, CurseForge
 * Logic only - rendering handled by PteroTheme
 */

const PluginManager = {
  sources: ["modrinth", "spigot", "curseforge"],
  currentPlugin: null,

  bindEvents() {
    const input = document.getElementById("pm-search");
    if (input) {
      input.onkeypress = (e) => { if (e.key === "Enter") this.search(); };
    }
  },

  closeVersionModal() {
    const modal = document.getElementById("pm-version-modal");
    if (modal) modal.style.display = "none";
    this.currentPlugin = null;
  },

  async search() {
    const q = document.getElementById("pm-search").value;
    const source = document.getElementById("pm-source").value;
    const results = document.getElementById("pm-results");
    if (!results) return;
    results.innerHTML = "<p style='color:var(--pt-text-secondary);'>Searching...</p>";

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
    if (!results) return;
    results.innerHTML = "";
    const list = Array.isArray(data) ? data : (data.hits || []);
    if (list.length === 0) {
      results.innerHTML = "<p style='color:var(--pt-text-muted);'>No plugins found.</p>";
      return;
    }
    list.forEach(p => {
      const iconHtml = p.icon
        ? `<img src="${p.icon}" class="pt-plugin-icon" alt="${p.name} icon" onerror="this.style.display='none'">`
        : `<div class="pt-plugin-icon-placeholder">P</div>`;
      const card = document.createElement("div");
      card.className = "pt-card pt-mb-2";
      card.style.width = "260px";
      card.style.textAlign = "center";
      card.innerHTML = `
        <div class="pt-card-body" style="padding:1rem;">
          ${iconHtml}
          <div class="pt-card-title" style="font-size:0.95rem; margin:0.5rem 0;">${p.name}</div>
          <div class="pt-text-muted pt-mb-2" style="font-size:0.8rem;">${p.author || "Unknown"} • ${p.source}</div>
          <div class="pt-text-muted pt-mb-2" style="font-size:0.75rem;">${p.downloads ? p.downloads.toLocaleString() : "0"} downloads</div>
          <button class="pt-btn pt-btn-sm pt-btn-primary pt-w-full pt-mb-2" onclick="PluginManager.openVersionPicker('${p.source}', '${p.id || p.name}', '${p.name}')">Choose Version & Install</button>
        </div>
      `;
      results.appendChild(card);
    });
  },

  async openVersionPicker(source, projectId, pluginName) {
    this.currentPlugin = { source, projectId, pluginName };
    const modal = document.getElementById("pm-version-modal");
    const list = document.getElementById("pm-version-list");
    if (!modal || !list) return;
    list.innerHTML = "<p style='color:var(--pt-text-secondary);'>Loading versions...</p>";
    modal.style.display = "flex";

    try {
      let versions = [];
      if (source === "modrinth") {
        const r = await fetch(`/api/plugins/modrinth/${projectId}/versions`);
        versions = await r.json();
      } else {
        versions = [{ version: "latest", file: `${projectId}.jar`, url: "", gameVersions: [], loaders: [] }];
      }

      list.innerHTML = versions.map((v, idx) => `
        <div class="pt-flex pt-justify-between pt-items-center pt-mb-2 pt-border-b pt-pb-2" style="border-color:var(--pt-border);">
          <div>
            <div style="font-weight:600;">${v.version}</div>
            <div style="font-size:0.75rem;color:var(--pt-text-muted);">${v.gameVersions ? v.gameVersions.slice(0,3).join(", ") : ""} ${v.loaders ? v.loaders.slice(0,3).join(", ") : ""}</div>
          </div>
          <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="PluginManager.confirmInstall(${idx})">Install</button>
        </div>
      `).join("");
    } catch (e) {
      list.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  },

  async confirmInstall(idx) {
    if (!this.currentPlugin) return;
    const { source, projectId, pluginName } = this.currentPlugin;
    const list = document.getElementById("pm-version-list");

    if (idx < 0 || idx >= list.children.length) return;

    let fileName = `${projectId}.jar`;
    let fileUrl = "";
    let version = "latest";

    if (source === "modrinth") {
      try {
        const r = await fetch(`/api/plugins/modrinth/${projectId}/versions`);
        const allVersions = await r.json();
        const v = allVersions[idx];
        fileName = v.file || fileName;
        fileUrl = v.url || "";
        version = v.version || "latest";
      } catch (e) {}
    } else {
      fileName = `${projectId}.jar`;
      fileUrl = `/api/plugins/${source}/download/${projectId}`;
    }

    try {
      const r = await fetch("/api/plugins/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, url: fileUrl, fileName, serverId: "global", version })
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
      if (!box) return;
      box.innerHTML = `
        <div class="pt-card-title" style="margin-bottom:0.5rem;">Installed Plugins</div>
        <table class="pt-table pt-w-full pt-mt-2">
          <thead><tr><th>Icon</th><th>Name</th><th>Action</th></tr></thead>
          <tbody>
            ${files.map(f => `
              <tr>
                <td><div class="pt-version-icon-placeholder">J</div></td>
                <td>${f.name}</td>
                <td><button class="pt-btn pt-btn-sm pt-btn-danger" onclick="PluginManager.remove('${f.name}')">Remove</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch (e) {
      const box = document.getElementById("pm-installed");
      if (box) box.innerHTML = "<p style='color:var(--pt-text-muted);'>No plugins installed.</p>";
    }
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

  refresh() {
    this.search();
    this.loadInstalled();
  },

  showToast(msg, type) {
    if (window.PteroTheme) window.PteroTheme.showToast(msg, type);
  }
};

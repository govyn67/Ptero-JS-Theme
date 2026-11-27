/*!
 * PteroJS Theme - Plugin Manager Frontend
 * Supports: Modrinth, Spigot, CurseForge
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
        </div>
      </div>
    `;
    this.loadInstalled();
  },

  bindEvents() {
    const input = document.getElementById("pm-search");
    input.addEventListener("keypress", (e) => { if (e.key === "Enter") this.search(); });
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
      const card = document.createElement("div");
      card.className = "pt-card pt-mb-2";
      card.style.width = "260px";
      card.innerHTML = `
        <div class="pt-card-body">
          <div class="pt-card-title">${p.name}</div>
          <div class="pt-text-muted pt-mb-2">${p.author || "Unknown"} • ${p.source}</div>
          <button class="pt-btn pt-btn-sm pt-btn-primary pt-w-full" onclick="PluginManager.install('${p.source}', '${p.id || p.name}', '${p.latestVersion || ''}')">Install</button>
        </div>
      `;
      results.appendChild(card);
    });
  },

  async install(source, projectId, version) {
    // Fetch version file URL then install
    try {
      let fileUrl = "";
      let fileName = "";
      if (source === "modrinth") {
        const r = await fetch(`/api/plugins/modrinth/${projectId}/versions`);
        const versions = await r.json();
        const v = versions[0];
        fileUrl = v.url;
        fileName = v.file;
      } else {
        // Spigot / CurseForge direct install placeholder
        fileUrl = `/api/plugins/${source}/download/${projectId}`;
        fileName = `${projectId}.jar`;
      }

      const r = await fetch("/api/plugins/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, url: fileUrl, fileName, serverId: "global" })
      });
      const res = await r.json();
      if (res.success) {
        this.showToast(`Installed ${fileName}`, "success");
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
          <thead><tr><th>Name</th><th>Action</th></tr></thead>
          <tbody>
            ${files.map(f => `<tr><td>${f.name}</td><td><button class="pt-btn pt-btn-sm pt-btn-danger" onclick="PluginManager.remove('${f.name}')">Remove</button></td></tr>`).join("")}
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

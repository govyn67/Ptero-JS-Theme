/*!
 * PteroJS Theme - Version Manager Logic
 * Supports: Paper, Purpur, Vanilla, Fabric, Forge, NeoForge, Spigot, Folia, Velocity, Bungeecord
 * Logic only - rendering handled by PteroTheme
 */

const VersionManager = {
  loaders: ["paper", "purpur", "vanilla", "fabric", "forge", "neoforge", "spigot", "folia", "velocity", "bungeecord"],

  async loadVersions() {
    const select = document.getElementById("vm-loader");
    const loader = select ? select.value : "paper";
    const box = document.getElementById("vm-versions");
    const title = document.getElementById("vm-versions-title");
    if (!box) return;
    box.innerHTML = "<p style='color:var(--pt-text-secondary);'>Loading versions...</p>";

    // Update loader icon
    const iconMap = {
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
    const boxIcon = document.getElementById("vm-loader-icon");
    const icon = iconMap[loader] || "";
    if (boxIcon) {
      boxIcon.innerHTML = icon ? `<img src="${icon}" class="pt-loader-icon" alt="${loader} icon" onerror="this.style.display='none'">` : "";
    }
    if (title) title.textContent = `${loader.charAt(0).toUpperCase() + loader.slice(1)} Versions`;

    try {
      let data = [];
      if (loader === "paper") {
        const r = await fetch("/api/versions/paper");
        data = await r.json();
      } else if (loader === "purpur") {
        const r = await fetch("/api/versions/purpur");
        data = await r.json();
      } else if (loader === "vanilla") {
        const r = await fetch("/api/versions/vanilla");
        data = await r.json();
      } else if (loader === "fabric") {
        const r = await fetch("/api/versions/fabric");
        data = await r.json();
      } else if (loader === "forge") {
        const r = await fetch("/api/versions/forge");
        data = await r.json();
      } else if (loader === "neoforge") {
        const r = await fetch("/api/versions/neoforge");
        data = await r.json();
      } else if (loader === "spigot") {
        const r = await fetch("/api/versions/spigot");
        data = await r.json();
      } else if (loader === "folia") {
        const r = await fetch("/api/versions/folia");
        data = await r.json();
      } else if (loader === "velocity") {
        const r = await fetch("/api/versions/velocity");
        data = await r.json();
      } else if (loader === "bungeecord") {
        const r = await fetch("/api/versions/bungeecord");
        data = await r.json();
      }
      this.renderVersions(data, loader);
    } catch (e) {
      box.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  },

  renderVersions(data, loader) {
    const box = document.getElementById("vm-versions");
    const items = Array.isArray(data) ? data : [];
    const iconMap = {
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
    const icon = iconMap[loader] || "";

    if (items.length === 0) {
      box.innerHTML = "<p style='color:var(--pt-text-muted);'>No versions found.</p>";
      return;
    }

    box.innerHTML = `
      <div class="pt-flex pt-justify-between pt-items-center pt-mb-2">
        <div class="pt-card-title" style="margin:0;">${loader.charAt(0).toUpperCase() + loader.slice(1)} Versions</div>
        ${icon ? `<img src="${icon}" class="pt-loader-icon" alt="${loader} icon" onerror="this.style.display='none'">` : ""}
      </div>
      <table class="pt-table pt-w-full pt-mt-2">
        <thead><tr><th>Icon</th><th>Version / Build</th><th>Type</th><th>Action</th></tr></thead>
        <tbody>
          ${items.map(v => `
            <tr>
              <td>
                ${icon ? `<img src="${icon}" class="pt-version-icon" alt="icon" onerror="this.style.display='none'">` : `<div class="pt-version-icon-placeholder">${loader.charAt(0).toUpperCase()}</div>`}
              </td>
              <td>
                <div style="font-weight:600;">${v.gameVersion || v.version || v.build}</div>
                <div style="font-size:0.75rem;color:var(--pt-text-muted);">Build: ${v.build || "-"}</div>
              </td>
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
    if (!status) return;
    status.innerHTML = `<p style="color:var(--pt-text-secondary);">Installing ${loader} ${version}...</p>`;
    try {
      const r = await fetch("/api/versions/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loader, version, build, serverId: "global" })
      });
      const res = await r.json();
      status.innerHTML = `<p style="color:var(--pt-success);">${res.message}</p>`;
    } catch (e) {
      status.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
  }
};

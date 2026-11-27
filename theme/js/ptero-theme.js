/*!
 * PteroJS Theme - JavaScript
 * For ptero-js (Node.js Pterodactyl panel fork)
 */

const PteroTheme = {
  version: "1.0.0",

  colors: {
    primary: "#6366f1",
    secondary: "#ec4899",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  },

  init() {
    this.injectCSS();
    this.setupSidebar();
    this.setupTooltips();
    this.setupAnimations();
    this.setupRouting();
    console.log(`[PteroTheme] v${this.version} initialized`);
  },

  injectCSS() {
    if (document.getElementById("ptero-theme-style")) return;
    const link = document.createElement("link");
    link.id = "ptero-theme-style";
    link.rel = "stylesheet";
    link.href = "/theme/css/ptero-theme.css";
    document.head.appendChild(link);
  },

  setupSidebar() {
    const sidebar = document.querySelector(".pt-sidebar");
    const toggle = document.querySelector('[data-toggle="sidebar"]');
    if (!sidebar || !toggle) return;

    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });

    // Sidebar nav click handling for theme pages
    document.querySelectorAll(".pt-nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        // Don't handle if it's a link or button inside
        if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return;

        const text = item.textContent.trim();
        if (text === "Plugin Manager") {
          e.preventDefault();
          this.navigateTo("plugin-manager");
        } else if (text === "Version Manager") {
          e.preventDefault();
          this.navigateTo("version-manager");
        }
      });
    });
  },

  navigateTo(page) {
    window.location.hash = page;
  },

  setupRouting() {
    const handleRoute = () => {
      const hash = window.location.hash.replace("#", "");

      if (hash === "plugin-manager") {
        this.showPluginManager();
      } else if (hash === "version-manager") {
        this.showVersionManager();
      }
    };

    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  },

  showPluginManager() {
    const main = document.querySelector(".pt-main");
    if (!main) return;

    // Highlight sidebar
    this.updateSidebarActive("Plugin Manager");

    main.innerHTML = `
      <div class="pt-fade-in">
        <div class="pt-settings-header">
          <h1 class="pt-settings-title">Plugin Manager</h1>
          <button class="pt-btn pt-btn-sm pt-btn-secondary" onclick="PluginManager.refresh()">Refresh</button>
        </div>

        <div class="pt-settings-grid">
          <div class="pt-settings-card">
            <div class="pt-settings-card-title"><span>Search Plugins</span></div>
            <div class="pt-settings-section">
              <div class="pt-flex pt-gap-2 pt-mb-2">
                <input type="text" id="pm-search" class="pt-form-input pt-w-full" placeholder="Search plugins (Modrinth / Spigot / CurseForge)...">
                <select id="pm-source" class="pt-form-input pt-form-select pt-w-full">
                  <option value="modrinth">Modrinth</option>
                  <option value="spigot">Spigot</option>
                  <option value="curseforge">CurseForge</option>
                </select>
                <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="PluginManager.search()">Search</button>
              </div>
              <div id="pm-results" class="pt-flex pt-gap-2 pt-mt-2" style="display:flex; flex-wrap:wrap;"></div>
            </div>
          </div>

          <div class="pt-settings-card">
            <div class="pt-settings-card-title"><span>Installed Plugins</span></div>
            <div class="pt-settings-section">
              <div id="pm-installed" class="pt-mt-2"></div>
            </div>
          </div>
        </div>

        <div id="pm-version-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
          <div style="background:var(--pt-surface); color:var(--pt-text); padding:2rem; border-radius:var(--pt-radius); min-width:350px; max-width:500px; border:1px solid var(--pt-border); box-shadow:var(--pt-shadow-lg);">
            <div class="pt-flex pt-justify-between pt-items-center pt-mb-2">
              <div class="pt-card-title" style="margin:0;">Select Version</div>
              <button class="pt-btn pt-btn-sm pt-btn-secondary" onclick="PluginManager.closeVersionModal()">Cancel</button>
            </div>
            <div id="pm-version-list" class="pt-mt-2"></div>
          </div>
        </div>
      </div>
    `;

    this.bindPluginEvents();
    PluginManager.loadInstalled();
  },

  bindPluginEvents() {
    const input = document.getElementById("pm-search");
    if (input) {
      input.onkeypress = (e) => { if (e.key === "Enter") PluginManager.search(); };
    }
  },

  showVersionManager() {
    const main = document.querySelector(".pt-main");
    if (!main) return;

    this.updateSidebarActive("Version Manager");

    const iconMap = {
      paper: "https://papermc.io/img/paper-logo.png",
      spigot: "https://www.spigotmc.org/wiki/images/thumb/5/5f/SpigotMC_Logo.png/200px-SpigotMC_Logo.png",
      forge: "https://files.minecraftforge.net/images/logo.png",
      fabric: "https://cdn.modrinth.com/data/6s8J2H6P/icon.png",
      velocity: "https://velocitypowered.com/images/logo.png",
      bungeecord: "https://ci.spigotmc.org/images/logo.png"
    };

    main.innerHTML = `
      <div class="pt-fade-in">
        <div class="pt-settings-header">
          <h1 class="pt-settings-title">Server Version Manager</h1>
        </div>

        <div class="pt-settings-grid">
          <div class="pt-settings-card">
            <div class="pt-settings-card-title"><span>Select Server Software</span></div>
            <div class="pt-settings-section">
              <div class="pt-flex pt-gap-2 pt-mb-2">
                <select id="vm-loader" class="pt-form-input pt-form-select pt-w-full">
                  ${["paper", "purpur", "vanilla", "fabric", "forge", "neoforge", "spigot", "folia", "velocity", "bungeecord"].map(l => `<option value="${l}">${l.charAt(0).toUpperCase() + l.slice(1)}</option>`).join("")}
                </select>
                <button class="pt-btn pt-btn-sm pt-btn-primary" onclick="VersionManager.loadVersions()">Load Versions</button>
              </div>
              <div id="vm-loader-icon" class="pt-mt-2 pt-text-center">
                ${iconMap.paper ? `<img src="${iconMap.paper}" class="pt-loader-icon" alt="paper icon" onerror="this.style.display='none'">` : ""}
              </div>
            </div>
          </div>

          <div class="pt-settings-card">
            <div class="pt-settings-card-title"><span id="vm-versions-title">Versions</span></div>
            <div class="pt-settings-section">
              <div id="vm-versions" class="pt-mt-2"><p style="color:var(--pt-text-secondary);">Select a loader and click Load Versions.</p></div>
              <div id="vm-install-status"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindVersionEvents();
  },

  bindVersionEvents() {
    const select = document.getElementById("vm-loader");
    if (select) {
      select.onchange = () => VersionManager.loadVersions();
    }
  },

  updateSidebarActive(text) {
    document.querySelectorAll(".pt-nav-item").forEach(item => {
      item.classList.remove("active");
      if (item.textContent.trim() === text) {
        item.classList.add("active");
      }
    });
  },

  setupTooltips() {
    document.querySelectorAll("[data-tooltip]").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const tooltip = document.createElement("div");
        tooltip.className = "pt-tooltip";
        tooltip.textContent = el.getAttribute("data-tooltip");
        tooltip.style.position = "absolute";
        tooltip.style.background = "#1e293b";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "0.375rem 0.75rem";
        tooltip.style.borderRadius = "0.375rem";
        tooltip.style.fontSize = "0.875rem";
        tooltip.style.zIndex = "9999";
        tooltip.style.pointerEvents = "none";
        document.body.appendChild(tooltip);

        const rect = el.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;

        el._ptTooltip = tooltip;
      });

      el.addEventListener("mouseleave", () => {
        if (el._ptTooltip) {
          el._ptTooltip.remove();
          el._ptTooltip = null;
        }
      });
    });
  },

  setupAnimations() {
    document.querySelectorAll(".pt-fade-in").forEach(el => {
      el.style.animation = "pt-fade-in 0.3s ease forwards";
    });
  },

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `pt-toast pt-toast-${type}`;
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      top: "1rem",
      right: "1rem",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      color: "#fff",
      fontSize: "0.9375rem",
      fontWeight: "500",
      zIndex: "9999",
      background: this.colors[type] || this.colors.info,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transform: "translateY(100px)",
      opacity: "0",
      transition: "all 0.3s ease"
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.transform = "translateY(100px)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  initAuth() {
    const tabs = document.querySelectorAll(".pt-auth-tab");
    const forms = document.querySelectorAll(".pt-auth-form");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-target");
        tabs.forEach(t => t.classList.remove("active"));
        forms.forEach(f => f.classList.remove("active"));
        tab.classList.add("active");
        const form = document.getElementById(target);
        if (form) form.classList.add("active");
      });
    });
  },

  initAdminSettings() {
    const toggle = document.querySelector('[data-setting="registration"]');
    if (toggle) {
      toggle.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        localStorage.setItem("ptero_registration_enabled", enabled);
        this.showToast(`Registration ${enabled ? "enabled" : "disabled"}`, "info");
      });
      const saved = localStorage.getItem("ptero_registration_enabled");
      if (saved !== null) toggle.checked = saved === "true";
    }

    const logoInput = document.getElementById("pt-logo-upload");
    const logoPreview = document.getElementById("pt-logo-preview");
    if (logoInput && logoPreview) {
      logoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        logoPreview.src = url;
        logoPreview.style.display = "block";
        localStorage.setItem("pt_logo_url", url);
      });
      const savedLogo = localStorage.getItem("pt_logo_url");
      if (savedLogo) {
        logoPreview.src = savedLogo;
        logoPreview.style.display = "block";
      }
    }

    const bgInput = document.getElementById("pt-bg-upload");
    const bgPreview = document.getElementById("pt-bg-preview");
    const applyBg = document.getElementById("pt-apply-bg");
    if (bgInput && bgPreview && applyBg) {
      bgInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        bgPreview.src = url;
        bgPreview.style.display = "block";
      });
      applyBg.addEventListener("click", () => {
        const file = bgInput.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        document.body.style.backgroundImage = `url(${url})`;
        localStorage.setItem("pt_bg_url", url);
        this.showToast("Background image applied", "success");
      });
      const savedBg = localStorage.getItem("pt_bg_url");
      if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
      }
    }

    document.querySelectorAll('[data-icon]').forEach(el => {
      const iconUrl = el.getAttribute("data-icon");
      if (iconUrl) {
        const img = el.querySelector("img, .pt-icon") || document.createElement("img");
        img.src = iconUrl;
        img.className = "pt-icon";
        el.prepend(img);
      }
    });
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    PteroTheme.init();
    if (document.querySelector(".pt-auth")) PteroTheme.initAuth();
    if (document.querySelector(".pt-settings")) PteroTheme.initAdminSettings();
  });
} else {
  PteroTheme.init();
  if (document.querySelector(".pt-auth")) PteroTheme.initAuth();
  if (document.querySelector(".pt-settings")) PteroTheme.initAdminSettings();
}

export default PteroTheme;

/*!
 * PteroJS Theme - JavaScript
 * For ptero-js (Node.js Pterodactyl fork)
 */

const PteroTheme = {
  version: "1.0.0",

  // Theme colors
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

  /* ===== Auth Page: Register toggle ===== */
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

  /* ===== Admin Settings ===== */
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

    // Logo upload preview
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

    // Background image upload preview
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

    // Sidebar icon picker
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

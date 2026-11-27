/*!
 * PteroJS Theme - TypeScript Source
 * For ptero-js (Node.js Pterodactyl fork)
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ToastOptions {
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  duration?: number;
}

export class PteroTheme {
  public readonly version: string = "1.0.0";
  public readonly colors: ThemeColors = {
    primary: "#6366f1",
    secondary: "#ec4899",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  };

  private styleElement: HTMLLinkElement | null = null;

  init(): void {
    this.injectCSS();
    this.setupSidebar();
    this.setupTooltips();
    this.setupAnimations();
    console.log(`[PteroTheme] v${this.version} initialized`);
  }

  private injectCSS(): void {
    if (document.getElementById("ptero-theme-style")) return;
    const link = document.createElement("link");
    link.id = "ptero-theme-style";
    link.rel = "stylesheet";
    link.href = "/theme/css/ptero-theme.css";
    document.head.appendChild(link);
    this.styleElement = link;
  }

  private setupSidebar(): void {
    const sidebar = document.querySelector<HTMLElement>(".pt-sidebar");
    const toggle = document.querySelector<HTMLElement>('[data-toggle="sidebar"]');
    if (!sidebar || !toggle) return;

    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  private setupTooltips(): void {
    document.querySelectorAll<HTMLElement>("[data-tooltip]").forEach((el) => {
      const show = () => {
        const tooltip = document.createElement("div");
        tooltip.className = "pt-tooltip";
        tooltip.textContent = el.getAttribute("data-tooltip") || "";
        Object.assign(tooltip.style, {
          position: "absolute",
          background: "#1e293b",
          color: "#fff",
          padding: "0.375rem 0.75rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          zIndex: "9999",
          pointerEvents: "none"
        });
        document.body.appendChild(tooltip);

        const rect = el.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;

        (el as any)._ptTooltip = tooltip;
      };

      const hide = () => {
        const tooltip = (el as any)._ptTooltip;
        if (tooltip) {
          tooltip.remove();
          (el as any)._ptTooltip = null;
        }
      };

      el.addEventListener("mouseenter", show);
      el.addEventListener("mouseleave", hide);
    });
  }

  private setupAnimations(): void {
    document.querySelectorAll<HTMLElement>(".pt-fade-in").forEach((el) => {
      el.style.animation = "pt-fade-in 0.3s ease forwards";
    });
  }

  showToast(options: string | ToastOptions): void {
    const msg = typeof options === "string" ? { message: options } : options;
    const type = msg.type || "info";
    const duration = msg.duration || 3000;

    const toast = document.createElement("div");
    toast.className = `pt-toast pt-toast-${type}`;
    toast.textContent = msg.message;
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
      background: this.colors[type],
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
    }, duration);
  }

  destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    document.querySelectorAll(".pt-toast").forEach((t) => t.remove());
  }
}

const theme = new PteroTheme();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => theme.init());
} else {
  theme.init();
}

export { theme };

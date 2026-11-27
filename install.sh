#!/usr/bin/env bash
#
# PteroJS Theme Installer
# For ptero-js (Node.js Pterodactyl panel fork) - git cloned directory
# Inspired by NookTheme
#
# Options:
#   1. Install theme on panel
#   2. Uninstall theme
#   3. Exit
#

set -euo pipefail

THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PANEL_DIR=""
BACKUP_DIR="${THEME_DIR}/backup"

CSS_SRC="${THEME_DIR}/theme/css/ptero-theme.css"
JS_SRC="${THEME_DIR}/theme/js/ptero-theme.js"
PM_JS_SRC="${THEME_DIR}/theme/js/plugin-manager.js"
VM_JS_SRC="${THEME_DIR}/theme/js/version-manager.js"
SERVER_SRC="${THEME_DIR}/server"
ICONS_SRC="${THEME_DIR}/theme/icons"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_err()   { echo -e "${RED}[ERR]${NC}   $*" >&2; }

print_header() {
  clear
  echo -e "${CYAN}"
  echo "  ____  _             ____             __        __   "
  echo " / ___|| |_ __ _ _ __/ ___|  ___ _ __  \ \      / /_ _"
  echo " \___ \| __/ _\` | '_ \___ \ / _ \ '__|  \ \ /\ / / _\` |"
  echo "  ___) | || (_| | | | |__) |  __/ |      \ V  V / (_| |"
  echo " |____/ \__\__,_|_| |_|____/ \___|_|       \_/\_/ \__,_|"
  echo ""
  echo "       PteroJS Theme Installer (Node.js Pterodactyl fork)"
  echo "       Inspired by NookTheme"
  echo -e "${NC}"
  echo
}

pause() {
  echo
  read -rp "Press Enter to continue..." _
}

detect_panel() {
  # Try to auto-detect a sibling ptero-js directory
  local auto_detected=""
  if [ -d "${THEME_DIR}/../ptero-js" ]; then
    auto_detected="${THEME_DIR}/../ptero-js"
  elif [ -d "${THEME_DIR}/ptero-js" ]; then
    auto_detected="${THEME_DIR}/ptero-js"
  fi

  if [ -n "$auto_detected" ]; then
    PANEL_DIR="$(cd "$auto_detected" 2>/dev/null && pwd)"
    log_ok "Auto-detected ptero-js directory: $PANEL_DIR"
    return 0
  fi

  # Prompt user
  if [ -z "$PANEL_DIR" ]; then
    log_warn "No ptero-js directory detected."
    echo
    echo "Your ptero-js is a git-cloned directory (NOT /var/www)."
    echo "Example paths:"
    echo "  /home/user/ptero-js"
    echo "  ./ptero-js"
    echo "  /workspaces/haiku/ptero-js"
    echo
    read -rp "Enter the full path to your cloned ptero-js directory: " PANEL_DIR
  fi

  # Resolve to absolute path
  PANEL_DIR="$(cd "$PANEL_DIR" 2>/dev/null && pwd || echo "$PANEL_DIR")"

  # Safety: refuse theme dir itself
  if [ "$PANEL_DIR" = "$THEME_DIR" ]; then
    log_err "You entered the theme directory itself ($THEME_DIR)."
    log_err "Please enter your separate ptero-js clone directory."
    return 1
  fi

  if [ ! -d "$PANEL_DIR" ]; then
    log_err "Directory does not exist: $PANEL_DIR"
    return 1
  fi

  log_ok "Panel directory set: $PANEL_DIR"
  return 0
}

find_static_dir() {
  # Search common static/public folders inside ptero-js
  local candidates=(
    "$PANEL_DIR/public"
    "$PANEL_DIR/build"
    "$PANEL_DIR/dist"
    "$PANEL_DIR/static"
    "$PANEL_DIR/assets"
    "$PANEL_DIR/frontend/public"
    "$PANEL_DIR/frontend/build"
    "$PANEL_DIR/frontend/dist"
    "$PANEL_DIR/client/public"
    "$PANEL_DIR/client/build"
    "$PANEL_DIR/client/dist"
    "$PANEL_DIR/next/public"
    "$PANEL_DIR/nuxt/dist"
  )

  for dir in "${candidates[@]}"; do
    if [ -d "$dir" ]; then
      echo "$dir"
      return 0
    fi
  done

  # Fallback: use PANEL_DIR itself
  echo "$PANEL_DIR"
  return 0
}

find_layout_html() {
  local search_dir="$1"
  # Search for HTML/layout entry files (most specific first)
  local files=(
    "$search_dir/index.html"
    "$search_dir/index.ejs"
    "$search_dir/views/index.ejs"
    "$search_dir/views/layout.ejs"
    "$search_dir/views/layout.html"
    "$search_dir/views/main.ejs"
    "$search_dir/layouts/layout.ejs"
    "$search_dir/layouts/main.ejs"
    "$PANEL_DIR/index.html"
    "$PANEL_DIR/index.ejs"
    "$PANEL_DIR/views/index.ejs"
    "$PANEL_DIR/views/layout.ejs"
    "$PANEL_DIR/views/layout.html"
    "$PANEL_DIR/views/main.ejs"
    "$PANEL_DIR/layouts/layout.ejs"
    "$PANEL_DIR/layouts/main.ejs"
  )
  for f in "${files[@]}"; do
    if [ -f "$f" ]; then
      echo "$f"
      return 0
    fi
  done
  echo ""
  return 1
}

install_theme() {
  echo
  log_info "Installing PteroJS Theme..."
  echo

  if ! detect_panel; then
    pause
    return 1
  fi

  STATIC_DIR=$(find_static_dir)
  log_ok "Using static directory: $STATIC_DIR"

  # Safety: never install into theme dir itself
  if [ "$STATIC_DIR" = "$THEME_DIR" ]; then
    log_err "Detected panel directory is the theme directory itself."
    log_err "Please re-run and enter your separate ptero-js clone path."
    pause
    return 1
  fi

  THEME_DEST="$STATIC_DIR/theme"
  mkdir -p "$THEME_DEST/css" "$THEME_DEST/js" "$THEME_DEST/icons"

  # Backup existing theme assets
  mkdir -p "$BACKUP_DIR"
  for f in ptero-theme.css ptero-theme.js plugin-manager.js version-manager.js; do
    if [ -f "$THEME_DEST/js/$f" ]; then
      cp "$THEME_DEST/js/$f" "$BACKUP_DIR/$f.bak"
    fi
  done
  if [ -f "$THEME_DEST/css/ptero-theme.css" ]; then
    cp "$THEME_DEST/css/ptero-theme.css" "$BACKUP_DIR/ptero-theme.css.bak"
  fi

  # Copy theme assets
  cp "$CSS_SRC" "$THEME_DEST/css/ptero-theme.css"
  cp "$JS_SRC"  "$THEME_DEST/js/ptero-theme.js"
  cp "$PM_JS_SRC" "$THEME_DEST/js/plugin-manager.js"
  cp "$VM_JS_SRC" "$THEME_DEST/js/version-manager.js"
  log_ok "Theme assets copied to $THEME_DEST"

  # Copy icons
  if [ -d "$ICONS_SRC" ]; then
    cp -r "$ICONS_SRC"/* "$THEME_DEST/icons/" 2>/dev/null || true
    log_ok "Theme icons copied to $THEME_DEST/icons"
  fi

  # Copy server routes
  if [ -d "$SERVER_SRC" ]; then
    cp -r "$SERVER_SRC" "$PANEL_DIR/server" 2>/dev/null || true
    log_ok "Server routes copied to $PANEL_DIR/server"
  fi

  # Inject theme into HTML layout file
  local injected=0
  LAYOUT_HTML=$(find_layout_html "$STATIC_DIR")
  if [ -z "$LAYOUT_HTML" ]; then
    LAYOUT_HTML=$(find_layout_html "$PANEL_DIR")
  fi

  if [ -n "$LAYOUT_HTML" ]; then
    if grep -q "ptero-theme" "$LAYOUT_HTML"; then
      log_info "Theme already referenced in $LAYOUT_HTML"
    else
      # Add CSS and JS before </head>
      if grep -q "</head>" "$LAYOUT_HTML"; then
        sed -i 's|</head>|<link rel="stylesheet" href="/theme/css/ptero-theme.css">\n  <script defer src="/theme/js/ptero-theme.js"></script>\n  <script defer src="/theme/js/plugin-manager.js"></script>\n  <script defer src="/theme/js/version-manager.js"></script>\n</head>|' "$LAYOUT_HTML"
      elif grep -q "</body>" "$LAYOUT_HTML"; then
        sed -i 's|</body>|<link rel="stylesheet" href="/theme/css/ptero-theme.css">\n  <script defer src="/theme/js/ptero-theme.js"></script>\n  <script defer src="/theme/js/plugin-manager.js"></script>\n  <script defer src="/theme/js/version-manager.js"></script>\n</body>|' "$LAYOUT_HTML"
      fi
      log_ok "Theme injected into $LAYOUT_HTML"
    fi
    injected=1
  fi

  # Add sidebar nav items for Plugin Manager and Version Manager
  if [ -n "$LAYOUT_HTML" ]; then
    if ! grep -q "Plugin Manager" "$LAYOUT_HTML"; then
      # Add nav items before closing </nav> or </aside>
      if grep -q "</nav>" "$LAYOUT_HTML"; then
        sed -i 's|</nav>|<div class="pt-nav-item" onclick="location.href=\x27#plugin-manager\x27"><span>Plugin Manager</span></div>\n<div class="pt-nav-item" onclick="location.href=\x27#version-manager\x27"><span>Version Manager</span></div>\n</nav>|' "$LAYOUT_HTML"
      elif grep -q "</aside>" "$LAYOUT_HTML"; then
        sed -i 's|</aside>|<div class="pt-nav-item" onclick="location.href=\x27#plugin-manager\x27"><span>Plugin Manager</span></div>\n<div class="pt-nav-item" onclick="location.href=\x27#version-manager\x27"><span>Version Manager</span></div>\n</aside>|' "$LAYOUT_HTML"
      fi
      log_ok "Sidebar nav items added to $LAYOUT_HTML"
    fi
  fi

  if [ "$injected" -eq 0 ]; then
    log_warn "No HTML layout file found to auto-inject theme."
    log_info "Manually add these lines to your panel's main HTML inside <head> or before </body>:"
    echo
    echo -e "  ${CYAN}<link rel=\"stylesheet\" href=\"/theme/css/ptero-theme.css\">${NC}"
    echo -e "  ${CYAN}<script defer src=\"/theme/js/ptero-theme.js\"></script>${NC}"
    echo -e "  ${CYAN}<script defer src=\"/theme/js/plugin-manager.js\"></script>${NC}"
    echo -e "  ${CYAN}<script defer src=\"/theme/js/version-manager.js\"></script>${NC}"
    echo
    log_info "Also add these sidebar nav items:"
    echo -e "  ${CYAN}<div class=\"pt-nav-item\" onclick=\"location.href='#plugin-manager'\"><span>Plugin Manager</span></div>${NC}"
    echo -e "  ${CYAN}<div class=\"pt-nav-item\" onclick=\"location.href='#version-manager'\"><span>Version Manager</span></div>${NC}"
    echo
  fi

  # Restart hint
  if command -v systemctl >/dev/null 2>&1; then
    if systemctl list-unit-files 2>/dev/null | grep -q "ptero-js\|pterojs\|ptero"; then
      log_info "Detected systemd service. Restarting panel..."
      systemctl restart ptero-js 2>/dev/null || systemctl restart pterojs 2>/dev/null || true
      log_ok "Panel service restarted"
    else
      log_info "No systemd service. Restart your ptero-js node process manually."
    fi
  else
    log_info "Restart your ptero-js node process manually to apply changes."
  fi

  echo
  log_ok "PteroJS Theme installed successfully!"
  log_info "Theme files: $THEME_DEST"
  log_info "IMPORTANT: Restart your ptero-js node process, then refresh your browser (Ctrl+F5)."
  pause
}

uninstall_theme() {
  echo
  log_info "Uninstalling PteroJS Theme..."
  echo

  if ! detect_panel; then
    pause
    return 1
  fi

  STATIC_DIR=$(find_static_dir)
  THEME_DEST="$STATIC_DIR/theme"

  if [ -d "$THEME_DEST" ]; then
    rm -rf "$THEME_DEST"
    log_ok "Removed theme assets from $THEME_DEST"
  else
    log_info "No theme assets found at $THEME_DEST"
  fi

  # Remove theme references from HTML
  for html in "$STATIC_DIR/index.html" "$STATIC_DIR/index.ejs" "$STATIC_DIR/views/index.ejs" "$STATIC_DIR/views/layout.ejs" "$PANEL_DIR/index.html" "$PANEL_DIR/index.ejs" "$PANEL_DIR/views/index.ejs" "$PANEL_DIR/views/layout.ejs"; do
    if [ -f "$html" ] && grep -q "ptero-theme" "$html"; then
      sed -i '/ptero-theme/d' "$html"
      log_ok "Removed theme reference from $html"
    fi
  done

  # Restore backups
  if [ -f "$BACKUP_DIR/ptero-theme.css.bak" ] && [ -d "$THEME_DEST/css" ]; then
    cp "$BACKUP_DIR/ptero-theme.css.bak" "$THEME_DEST/css/ptero-theme.css"
    log_info "Restored backed-up CSS"
  fi
  if [ -f "$BACKUP_DIR/ptero-theme.js.bak" ] && [ -d "$THEME_DEST/js" ]; then
    cp "$BACKUP_DIR/ptero-theme.js.bak" "$THEME_DEST/js/ptero-theme.js"
    log_info "Restored backed-up JS"
  fi

  echo
  log_ok "PteroJS Theme uninstalled successfully."
  pause
}

show_menu() {
  print_header
  echo -e "  ${CYAN}1.${NC} Install theme on panel"
  echo -e "  ${CYAN}2.${NC} Uninstall theme"
  echo -e "  ${CYAN}3.${NC} Exit"
  echo
  read -rp "Select an option [1-3]: " choice
}

main() {
  while true; do
    show_menu
    case "$choice" in
      1) install_theme ;;
      2) uninstall_theme ;;
      3)
        echo
        log_info "Exiting PteroJS Theme Installer. Goodbye!"
        echo
        exit 0
        ;;
      *)
        log_err "Invalid option. Please select 1, 2, or 3."
        sleep 1
        ;;
    esac
  done
}

main "$@"

# PteroJS Theme

Clean, modern theme for the [ptero-js](https://github.com/jishnuthegamer/ptero-js) Pterodactyl panel fork (Node.js). Inspired by [NookTheme](https://github.com/Nookure/NookTheme).

Repository: `https://github.com/govyn67/Ptero-JS-Theme`

---

## Features

- Dark slate background + indigo accent (NookTheme style)
- Plugin Manager: Modrinth, Spigot, CurseForge (with icons + version picker)
- Version Manager: Paper, Purpur, Vanilla, Fabric, Forge, NeoForge, Spigot, Folia, Velocity, Bungeecord (with loader icons)
- Auth: Register tab (Username, Email, Password, Confirm Password)
- Admin Settings: Enable registration, Logo, Background image, Sidebar icons
- Sidebar nav items: Plugin Manager, Version Manager
- Installer: `install.sh` — Install / Uninstall / Exit

---

## Download

```bash
git clone https://github.com/govyn67/Ptero-JS-Theme.git
cd Ptero-JS-Theme
```

Or download individual files via GitHub raw:

```bash
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/install.sh -o install.sh
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/theme/css/ptero-theme.css -o theme/css/ptero-theme.css
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/theme/js/ptero-theme.js -o theme/js/ptero-theme.js
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/theme/js/plugin-manager.js -o theme/js/plugin-manager.js
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/theme/js/version-manager.js -o theme/js/version-manager.js
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/server/routes/plugins.js -o server/routes/plugins.js
curl -L https://raw.githubusercontent.com/govyn67/Ptero-JS-Theme/main/server/routes/versions.js -o server/routes/versions.js
```

---

## Install (works with git-cloned ptero-js, no /var/www required)

```bash
cd Ptero-JS-Theme
chmod +x install.sh
./install.sh
```

Menu:
- `1` — Install theme on panel
- `2` — Uninstall theme
- `3` — Exit

When prompted, enter the path to your **cloned ptero-js directory** (NOT the theme folder).
Example: `/home/user/ptero-js`, `./ptero-js`, or `.` if you're already inside it.

The installer will:
1. Find your ptero-js directory
2. Copy theme CSS/JS/icons to its static folder (`public/theme/` or `theme/`)
3. Copy server routes (plugin & version manager API)
4. Inject theme CSS/JS links into your panel's HTML layout
5. Add Plugin Manager & Version Manager sidebar nav items

**No `/var/www` required.** Works with any git-cloned ptero-js folder.

---

## After Install — Critical Steps

```bash
# 1. Restart your ptero-js node process (from your ptero-js directory)
npm start
# or: node index.js
# or: pm2 restart ptero-js

# 2. Hard refresh your browser
# Windows/Linux: Ctrl + F5
# Mac: Cmd + Shift + R
```

If the theme doesn't show after refresh, clear your browser cache or open in incognito mode.

---

## Usage

- **Plugin Manager**: Click "Plugin Manager" in the sidebar → search Modrinth/Spigot/CurseForge → choose version → install
- **Version Manager**: Click "Version Manager" in the sidebar → select loader (Paper/Spigot/Forge/Fabric/Velocity/Bungeecord) → load versions → install

---

## Uninstall

```bash
cd Ptero-JS-Theme
./install.sh
# Select option 2: Uninstall theme
# Then restart your ptero-js node process and hard refresh
```

---

## TypeScript Build

```bash
npm install
npm run build
```

---

## Start API Server (plugin & version manager)

```bash
npm install
npm run server
# http://localhost:3000
```

---

## License

GNU GPLv3. Not affiliated with Pterodactyl® Panel.

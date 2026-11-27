# PteroJS Theme

Clean, modern theme for the [ptero-js](https://github.com/jishnuthegamer/ptero-js) Pterodactyl panel fork (Node.js). Inspired by [NookTheme](https://github.com/Nookure/NookTheme).

Repository: `https://github.com/govyn67/Ptero-JS-Theme`

---

## Features

- Theme CSS + JS (dark slate + indigo)
- Plugin Manager: Modrinth, Spigot, CurseForge
- Version Manager: Paper, Spigot, Forge, Fabric, Velocity, Bungeecord
- Auth: Register tab (Username, Email, Password, Confirm Password)
- Admin Settings: Enable registration, Logo, Background image, Sidebar icons
- Installer: `install.sh` — Install / Uninstall / Exit

---

## Download

```bash
# Clone everything
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

Menu options:
- `1` — Install theme on panel
- `2` — Uninstall theme
- `3` — Exit

When prompted, enter the path to your **cloned ptero-js directory** (e.g. `./ptero-js`, `/home/user/ptero-js`, or just `.` if you're already inside it).

The installer will:
1. Find your ptero-js directory
2. Copy theme CSS/JS into its `public/theme/` (or creates `theme/` in the panel dir)
3. Copy server routes into `panel/server/`
4. Inject theme links into your `index.html` / `index.ejs` / `views/layout.ejs`
5. Tell you to restart your node process

**No `/var/www` required.** Works with any git-cloned ptero-js folder.

---

## Manual Install

```bash
# From inside your cloned ptero-js directory
cd /path/to/ptero-js

# Copy theme assets
cp -r /path/to/Ptero-JS-Theme/theme/css public/theme/css 2>/dev/null || cp -r /path/to/Ptero-JS-Theme/theme/css ./theme/css
cp -r /path/to/Ptero-JS-Theme/theme/js public/theme/js 2>/dev/null || cp -r /path/to/Ptero-JS-Theme/theme/js ./theme/js
cp -r /path/to/Ptero-JS-Theme/theme/icons public/theme/icons 2>/dev/null || cp -r /path/to/Ptero-JS-Theme/theme/icons ./theme/icons

# Copy server routes
cp -r /path/to/Ptero-JS-Theme/server ./server

# Inject theme into your main HTML (index.html, index.ejs, views/layout.ejs, etc.)
# Add inside <head> or before </body>:
<link rel="stylesheet" href="/theme/css/ptero-theme.css">
<script defer src="/theme/js/ptero-theme.js"></script>
<script defer src="/theme/js/plugin-manager.js"></script>
<script defer src="/theme/js/version-manager.js"></script>

# Restart your node process
```

---

## Uninstall

```bash
cd Ptero-JS-Theme
./install.sh
# Select option 2: Uninstall theme
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

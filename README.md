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

## Install (inside your ptero-js directory)

Your ptero-js folder is just the git-cloned `ptero-js` directory (no `/var/www`).

```bash
# From inside your ptero-js directory
cd ptero-js

# Copy theme assets into ptero-js public/theme
cp -r /path/to/Ptero-JS-Theme/theme/css public/theme/css
cp -r /path/to/Ptero-JS-Theme/theme/js public/theme/js
cp -r /path/to/Ptero-JS-Theme/theme/icons public/theme/icons

# Copy server routes into ptero-js
cp -r /path/to/Ptero-JS-Theme/server server

# Inject theme into your panel's main HTML
# Add these lines inside <head> or before </body> in your entry HTML file:
#   index.html, index.ejs, views/layout.ejs, etc.

<link rel="stylesheet" href="/theme/css/ptero-theme.css">
<script defer src="/theme/js/ptero-theme.js"></script>
<script defer src="/theme/js/plugin-manager.js"></script>
<script defer src="/theme/js/version-manager.js"></script>

# Restart your panel
# (no systemd /var/www — restart your node process however you run it)
```

---

## Using the Installer

```bash
cd Ptero-JS-Theme
chmod +x install.sh
./install.sh
```

Menu:
- `1` — Install theme on panel
- `2` — Uninstall theme
- `3` — Exit

When prompted for the panel directory, enter your `ptero-js` folder path (e.g. `/home/user/ptero-js` or just `./ptero-js`).

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

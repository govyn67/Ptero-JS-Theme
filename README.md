# PteroJS Theme

Clean, modern theme for the [ptero-js](https://github.com/jishnuthegamer/ptero-js) Pterodactyl panel fork (Node.js). Inspired by [NookTheme](https://github.com/Nookure/NookTheme).

Repository: `https://github.com/<your-username>/Ptero-JS-Theme`

---

## Features

- Theme CSS + JS (dark slate + indigo)
- Plugin Manager: Modrinth, Spigot, CurseForge
- Version Manager: Paper, Spigot, Forge, Fabric, Velocity, Bungeecord
- Auth: Register tab (Username, Email, Password, Confirm Password)
- Admin Settings: Enable registration, Logo, Background image, Sidebar icons
- Installer: `install.sh` — Install / Uninstall / Exit

---

## Download (GitHub Raw)

Replace `<your-username>` with your GitHub username and `main` with your branch.

```bash
# Download everything
git clone https://github.com/<your-username>/Ptero-JS-Theme.git
cd Ptero-JS-Theme

# Or download individual files
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/install.sh -o install.sh
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/theme/css/ptero-theme.css -o theme/css/ptero-theme.css
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/theme/js/ptero-theme.js -o theme/js/ptero-theme.js
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/theme/js/plugin-manager.js -o theme/js/plugin-manager.js
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/theme/js/version-manager.js -o theme/js/version-manager.js
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/server/routes/plugins.js -o server/routes/plugins.js
curl -L https://raw.githubusercontent.com/<your-username>/Ptero-JS-Theme/main/server/routes/versions.js -o server/routes/versions.js
```

---

## Install (run on your ptero-js panel server)

```bash
cd Ptero-JS-Theme
chmod +x install.sh
./install.sh
```

Menu options:
- `1` — Install theme on panel
- `2` — Uninstall theme
- `3` — Exit

The installer auto-detects your panel directory (default `/var/www/ptero-js`). You can enter a custom path when prompted.

---

## Manual Install

```bash
# Copy theme assets
cp theme/css/ptero-theme.css /var/www/ptero-js/public/theme/css/
cp theme/js/ptero-theme.js /var/www/ptero-js/public/theme/js/
cp theme/js/plugin-manager.js /var/www/ptero-js/public/theme/js/
cp theme/js/version-manager.js /var/www/ptero-js/public/theme/js/
cp -r theme/icons /var/www/ptero-js/public/theme/icons/

# Copy server routes
cp -r server /var/www/ptero-js/server/

# Inject theme into your panel's main HTML (index.html, index.ejs, views/layout.ejs, etc.)
# Add these lines inside <head> or before </body>:
echo '<link rel="stylesheet" href="/theme/css/ptero-theme.css">' >> /var/www/ptero-js/public/index.html
echo '<script defer src="/theme/js/ptero-theme.js"></script>' >> /var/www/ptero-js/public/index.html
echo '<script defer src="/theme/js/plugin-manager.js"></script>' >> /var/www/ptero-js/public/index.html
echo '<script defer src="/theme/js/version-manager.js"></script>' >> /var/www/ptero-js/public/index.html

# Restart panel
sudo systemctl restart ptero-js
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

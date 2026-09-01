# Deployment Folder for GitHub Pages

This directory contains the production-ready build of the **Staff Management System** application.

## 🚀 Optimization Notice
- All data and map layer files have been optimized to **under 4 MB each** (well below GitHub's 25 MB web upload limit).
- Unused ETL datasets (`historical_staff_v2.json`) have been removed from the production bundle to keep deployment lightweight.

## How to Host on GitHub Pages

### Option 1: Web Interface Upload (Drag & Drop)
1. Go to your repository on GitHub.com.
2. Click **Add file** -> **Upload files**.
3. Select or drag-and-drop all files and folders inside this `docs/` directory.
4. Click **Commit changes**.
5. Go to **Settings** -> **Pages** -> under **Source**, select `main` branch and `/` root (or `/docs`).

### Option 2: Push via Command Line (Git)
```bash
git add docs/
git commit -m "Deploy Staff Management System build"
git push origin main
```
Then in GitHub Repository **Settings** -> **Pages**, set source to `main` branch and `/docs` folder.

## Verification Checklist
- **HashRouter Navigation**: Hash-based URLs (`/#/employee/list`) ensure seamless direct link sharing.
- **SPA Fallback**: `404.html` handles any non-hash deep links gracefully.
- **Jekyll Bypassed**: `.nojekyll` guarantees raw assets load without GitHub Pages mangling.
- **Fast Map Load**: Map GeoJSON boundary layers optimized from 44 MB down to 3 MB for fast 60FPS map rendering.

# Deployment Folder for GitHub Pages

This directory contains the production-ready build of the **Staff Management System** application.

## How to Host on GitHub Pages

### Option 1: Standard Repository Deployment (Recommended)
1. Push this repository to GitHub.
2. Go to your GitHub repository -> **Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
4. Under **Branch**, select `main` (or `master`) and change folder to `/docs`.
5. Click **Save**. Your site will be published at `https://<your-username>.github.io/<repository-name>/`.

### Option 2: Upload Files Directly to a New Repository / gh-pages Branch
If you want to host the site in a dedicated repository:
1. Copy all contents inside this `docs` folder.
2. Upload/Push these files to the root of your target GitHub repository or `gh-pages` branch.
3. Enable GitHub Pages for the root (`/`) directory in GitHub Settings.

## Features & Verification Included
- **Client-Side Routing**: Handled seamlessly with `HashRouter` (`/#/route`) for error-free URL sharing.
- **SPA Fallback**: `404.html` included to prevent GitHub Pages routing errors.
- **Asset Processing**: `.nojekyll` included to prevent Jekyll build interference.
- **Embedded Data**: `latest_staff_v2.json`, `historical_staff_v2.json`, and map GeoJSON layers pre-bundled in `data/`.

# Deployment Guide

## Quick Start - GitHub Pages

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository (e.g., `daily-tracker-pwa`)
2. Don't initialize with README (we already have one)

### Step 2: Push Code to GitHub

```bash
cd /Users/ankurgulati/work/projects/daily-tracker-pwa
git init
git add .
git commit -m "Initial commit: Daily Tracker PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/daily-tracker-pwa.git
git push -u origin main
```

### Step 3: Create App Icons

Before deploying, you need to create app icons:

1. Create two PNG images:
   - `public/icons/icon-192.png` (192x192 pixels)
   - `public/icons/icon-512.png` (512x512 pixels)

2. You can use:
   - Online tools: https://realfavicongenerator.net/
   - Image editor: Photoshop, GIMP, Canva, Figma
   - Or use a simple colored square for testing

3. Place the icons in `public/icons/` directory

### Step 4: Deploy

```bash
npm run deploy
```

This will:
- Build the production version
- Create/update the `gh-pages` branch
- Deploy to GitHub Pages

### Step 5: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" → "Pages"
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click "Save"

### Step 6: Access Your App

Your app will be available at:
`https://YOUR_USERNAME.github.io/daily-tracker-pwa/`

(Replace YOUR_USERNAME with your GitHub username)

### Step 7: Install on iPhone

1. Open Safari on your iPhone
2. Navigate to your GitHub Pages URL
3. Tap the Share button (square with arrow)
4. Select "Add to Home Screen"
5. The app will install as a PWA

## Troubleshooting

### Icons Not Showing

- Make sure icon files are actual PNG images (not text files)
- Check that files are in `public/icons/` directory
- Verify file names match exactly: `icon-192.png` and `icon-512.png`

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript compiles: `npm run build`
- Look for error messages in the terminal

### GitHub Pages Not Updating

- Wait a few minutes after deployment (GitHub Pages can take time to update)
- Clear browser cache
- Check GitHub Actions/Pages settings for any errors

### PWA Not Installing

- Make sure you're accessing via HTTPS (GitHub Pages provides this)
- Check browser console for any errors
- Verify manifest.json is accessible
- Try a different browser (Chrome works best for PWA testing)

## Manual Deployment (Alternative)

If `npm run deploy` doesn't work:

```bash
# Build the app
npm run build

# The dist/ folder contains the built files
# You can manually upload these to any static hosting service
```

## Local Testing

Before deploying, test locally:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

## Updating the App

After making changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
npm run deploy
```

The app will automatically update on GitHub Pages.


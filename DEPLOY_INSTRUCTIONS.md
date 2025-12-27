# Deployment Instructions

## Step 1: Connect to Your GitHub Repository

Run these commands (replace YOUR_USERNAME and REPO_NAME with your actual values):

```bash
cd /Users/ankurgulati/work/projects/daily-tracker-pwa
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy to GitHub Pages

After pushing to GitHub, run:

```bash
npm run deploy
```

This will:
- Build the production version
- Create/update the `gh-pages` branch
- Deploy to GitHub Pages

## Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

Your app will be available at:
`https://YOUR_USERNAME.github.io/REPO_NAME/`

## Step 4: Install on iPhone

1. Open **Safari** on your iPhone
2. Navigate to your GitHub Pages URL: `https://YOUR_USERNAME.github.io/REPO_NAME/`
3. Tap the **Share** button (square with arrow pointing up)
4. Scroll down and select **"Add to Home Screen"**
5. Customize the name if desired (default: "Daily Tracker")
6. Tap **"Add"**

The app will now appear on your home screen and work like a native app!

## Troubleshooting

- **Icons not showing**: Make sure the icon files exist in `public/icons/`
- **Build errors**: Run `npm run build` first to check for errors
- **GitHub Pages not updating**: Wait 1-2 minutes after deployment
- **PWA not installing**: Make sure you're accessing via HTTPS (GitHub Pages provides this automatically)


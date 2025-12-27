#!/bin/bash
# Deployment script for Daily Tracker PWA

echo "🚀 Daily Tracker PWA Deployment Script"
echo "========================================"
echo ""

# Check if repo URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh <github-repo-url>"
    echo "Example: ./deploy.sh https://github.com/yourusername/daily-tracker-pwa.git"
    echo ""
    echo "Or run these commands manually:"
    echo "  git remote add origin <your-repo-url>"
    echo "  git push -u origin main"
    echo "  npm run deploy"
    exit 1
fi

REPO_URL=$1

echo "📦 Step 1: Connecting to GitHub repository..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
echo "✅ Connected to: $REPO_URL"
echo ""

echo "📤 Step 2: Pushing code to GitHub..."
git push -u origin main
if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub. Please check your repository URL and permissions."
    exit 1
fi
echo "✅ Code pushed successfully"
echo ""

echo "🏗️  Step 3: Building and deploying to GitHub Pages..."
npm run deploy
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
echo "✅ Deployment complete!"
echo ""

echo "📱 Next Steps:"
echo "1. Go to your GitHub repository: $REPO_URL"
echo "2. Click Settings → Pages"
echo "3. Select source: Branch 'gh-pages', folder '/ (root)'"
echo "4. Click Save"
echo "5. Wait 1-2 minutes, then visit: https://$(echo $REPO_URL | sed 's/.*github.com\///' | sed 's/\.git$//' | sed 's|^| |' | awk '{print $1}').github.io/$(echo $REPO_URL | sed 's/.*\///' | sed 's/\.git$//')/"
echo ""
echo "6. On iPhone: Open Safari → Visit the URL → Share → Add to Home Screen"


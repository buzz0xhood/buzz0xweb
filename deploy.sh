#!/bin/bash
# ========================================
# buzzweb Deploy Script
# Deploy to GitHub Pages
# ========================================

set -e

echo "🚀 Starting buzzweb deployment..."

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M')"
fi

# Check if remote is set
if ! git remote -v | grep -q origin; then
    echo "❌ Please set your GitHub remote first:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

# Push to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
git push -u origin main

echo "✅ Deployment complete! Site will be live at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPO/"
echo ""
echo "📌 Note: If deploying to a repo subfolder, update the base href in index.html"
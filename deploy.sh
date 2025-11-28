#!/bin/bash
# SafeChat: GitHub & Vercel Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SafeChat: GitHub & Vercel Deployment Script          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Get GitHub username
echo ""
echo "🔗 GitHub Setup"
read -p "Enter your GitHub username: " github_username

if [ -z "$github_username" ]; then
    echo "❌ GitHub username cannot be empty"
    exit 1
fi

# Repository name
read -p "Enter repository name (default: safechat): " repo_name
repo_name=${repo_name:-safechat}

echo ""
echo "📝 Repository Details:"
echo "   Username: $github_username"
echo "   Repository: $repo_name"
echo ""

# Add git remote
echo "🔧 Configuring Git remote..."
git remote add origin https://github.com/$github_username/$repo_name.git 2>/dev/null || \
git remote set-url origin https://github.com/$github_username/$repo_name.git

echo "✅ Git remote configured"

# Push to GitHub
echo ""
echo "📤 Pushing code to GitHub..."
echo "   (You may be prompted for GitHub credentials)"
echo ""

git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo "   Repository: https://github.com/$github_username/$repo_name"
echo ""

# Ask about backend deployment
echo "🚀 Backend Deployment"
read -p "Deploy backend to Railway.app? (y/n): " deploy_backend

if [ "$deploy_backend" = "y" ]; then
    echo ""
    echo "📝 Backend Deployment Instructions:"
    echo "   1. Go to https://railway.app"
    echo "   2. Sign in with GitHub"
    echo "   3. Create new project"
    echo "   4. Select this GitHub repository"
    echo "   5. Set root directory to 'server'"
    echo "   6. Add environment variables:"
    echo "      - MONGODB_URI (from MongoDB Atlas)"
    echo "      - JWT_SECRET (generate: openssl rand -hex 32)"
    echo "      - NODE_ENV=production"
    echo "   7. Deploy"
    echo ""
    read -p "Press Enter once you have deployed the backend to Railway..."
    read -p "Enter your Railway backend URL: " railway_url
fi

# Ask about frontend deployment
echo ""
echo "🌐 Frontend Deployment to Vercel"
read -p "Deploy frontend to Vercel? (y/n): " deploy_frontend

if [ "$deploy_frontend" = "y" ]; then
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo ""
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo ""
    echo "🔐 Vercel Deployment"
    echo "   Starting Vercel deployment wizard..."
    echo ""
    echo "   When prompted:"
    echo "   - Set root directory to: client"
    echo "   - Build command: npm run build"
    echo "   - Output directory: build"
    echo ""
    read -p "Press Enter to continue..."
    
    cd "$(dirname "$0")"
    vercel
    
    echo ""
    echo "✅ Frontend deployed to Vercel!"
    read -p "Enter your Vercel frontend URL (e.g., https://safechat.vercel.app): " vercel_url
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Deployment Summary                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -z "$github_username" ]; then
    echo "📌 GitHub Repository:"
    echo "   https://github.com/$github_username/$repo_name"
    echo ""
fi

if [ ! -z "$railway_url" ]; then
    echo "⚙️  Backend (Railway):"
    echo "   $railway_url"
    echo ""
fi

if [ ! -z "$vercel_url" ]; then
    echo "🌐 Frontend (Vercel):"
    echo "   $vercel_url"
    echo ""
fi

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update Vercel environment variables with backend URL"
echo "   2. Test the application at your Vercel URL"
echo "   3. Monitor deployment logs for any issues"
echo "   4. Configure custom domain (optional)"
echo ""
echo "📚 Documentation:"
echo "   - Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "   - Feature Guide: RELATIVE_ALERT_IMPLEMENTATION_COMPLETE.md"
echo "   - API Documentation: API_DOCUMENTATION.md"
echo ""

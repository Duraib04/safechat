# SafeChat: GitHub & Vercel Deployment Script (PowerShell)
# This script automates the deployment process for Windows

function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $text" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$text)
    Write-Host "✅ $text" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$text)
    Write-Host "❌ $text" -ForegroundColor Red
}

function Write-Info {
    param([string]$text)
    Write-Host "ℹ️  $text" -ForegroundColor Blue
}

# Main execution
Write-Header "SafeChat: GitHub & Vercel Deployment Script        "

# Check prerequisites
Write-Host "📋 Checking prerequisites..."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "Git is not installed. Please install Git first."
    exit 1
}

Write-Success "Git is installed"

# Get GitHub username
Write-Host ""
Write-Host "🔗 GitHub Setup" -ForegroundColor Yellow
$github_username = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($github_username)) {
    Write-Error-Custom "GitHub username cannot be empty"
    exit 1
}

# Repository name
$repo_name = Read-Host "Enter repository name (default: safechat)"
if ([string]::IsNullOrWhiteSpace($repo_name)) {
    $repo_name = "safechat"
}

Write-Host ""
Write-Host "📝 Repository Details:" -ForegroundColor Yellow
Write-Host "   Username: $github_username"
Write-Host "   Repository: $repo_name"
Write-Host ""

# Add git remote
Write-Host "🔧 Configuring Git remote..." -ForegroundColor Yellow

try {
    git remote add origin "https://github.com/$github_username/$repo_name.git" 2>$null
} catch {
    git remote set-url origin "https://github.com/$github_username/$repo_name.git"
}

Write-Success "Git remote configured"

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host "   (You may be prompted for GitHub credentials)" -ForegroundColor Gray
Write-Host ""

git branch -M main
git push -u origin main

Write-Host ""
Write-Success "Code pushed to GitHub successfully!"
Write-Host "   Repository: https://github.com/$github_username/$repo_name"
Write-Host ""

# Ask about backend deployment
Write-Host "🚀 Backend Deployment" -ForegroundColor Yellow
$deploy_backend = Read-Host "Deploy backend to Railway.app? (y/n)"

$railway_url = ""
if ($deploy_backend -eq "y" -or $deploy_backend -eq "Y") {
    Write-Host ""
    Write-Info "Backend Deployment Instructions:"
    Write-Host "   1. Go to https://railway.app"
    Write-Host "   2. Sign in with GitHub"
    Write-Host "   3. Create new project"
    Write-Host "   4. Select this GitHub repository"
    Write-Host "   5. Set root directory to 'server'"
    Write-Host "   6. Add environment variables:"
    Write-Host "      - MONGODB_URI (from MongoDB Atlas)"
    Write-Host "      - JWT_SECRET (generate: openssl rand -hex 32)"
    Write-Host "      - NODE_ENV=production"
    Write-Host "   7. Deploy"
    Write-Host ""
    Read-Host "Press Enter once you have deployed the backend to Railway"
    $railway_url = Read-Host "Enter your Railway backend URL (e.g., https://safechat-api.up.railway.app)"
}

# Ask about frontend deployment
Write-Host ""
Write-Host "🌐 Frontend Deployment to Vercel" -ForegroundColor Yellow
$deploy_frontend = Read-Host "Deploy frontend to Vercel? (y/n)"

$vercel_url = ""
if ($deploy_frontend -eq "y" -or $deploy_frontend -eq "Y") {
    # Check if Vercel CLI is installed
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host ""
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    Write-Host ""
    Write-Info "Vercel Deployment"
    Write-Host "   Starting Vercel deployment wizard..."
    Write-Host ""
    Write-Host "   When prompted:"
    Write-Host "   - Set root directory to: client"
    Write-Host "   - Build command: npm run build"
    Write-Host "   - Output directory: build"
    Write-Host ""
    Read-Host "Press Enter to continue"
    
    vercel
    
    Write-Host ""
    Write-Success "Frontend deployed to Vercel!"
    $vercel_url = Read-Host "Enter your Vercel frontend URL (e.g., https://safechat.vercel.app)"
}

# Summary
Write-Header "Deployment Summary                            "

if (-not [string]::IsNullOrWhiteSpace($github_username)) {
    Write-Host "📌 GitHub Repository:" -ForegroundColor Yellow
    Write-Host "   https://github.com/$github_username/$repo_name"
    Write-Host ""
}

if (-not [string]::IsNullOrWhiteSpace($railway_url)) {
    Write-Host "⚙️  Backend (Railway):" -ForegroundColor Yellow
    Write-Host "   $railway_url"
    Write-Host ""
}

if (-not [string]::IsNullOrWhiteSpace($vercel_url)) {
    Write-Host "🌐 Frontend (Vercel):" -ForegroundColor Yellow
    Write-Host "   $vercel_url"
    Write-Host ""
}

Write-Success "Deployment complete!"
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update Vercel environment variables with backend URL"
Write-Host "   2. Test the application at your Vercel URL"
Write-Host "   3. Monitor deployment logs for any issues"
Write-Host "   4. Configure custom domain (optional)"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - Deployment Guide: DEPLOYMENT_GUIDE.md"
Write-Host "   - Feature Guide: RELATIVE_ALERT_IMPLEMENTATION_COMPLETE.md"
Write-Host "   - API Documentation: API_DOCUMENTATION.md"
Write-Host ""

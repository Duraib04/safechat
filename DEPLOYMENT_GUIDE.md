# SafeChat Deployment Guide: GitHub & Vercel

Your SafeChat application with the Relative Nearby Alert feature is ready for deployment! Follow these steps to push to GitHub and deploy to Vercel.

## Phase 1: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name:** `safechat` (or your preferred name)
3. **Description:** "Secure messaging platform with relative proximity alerts"
4. **Visibility:** Public (recommended for portfolio) or Private (for production)
5. **Don't initialize** with README, .gitignore, or license (we have these)
6. Click **Create repository**

### Step 2: Add Remote and Push

Copy the commands from GitHub's setup page. It will look like:

```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/safechat.git

# Rename branch and push
git branch -M main
git push -u origin main
```

Run these commands in PowerShell:

```powershell
cd "C:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat"
git remote add origin https://github.com/YOUR_USERNAME/safechat.git
git branch -M main
git push -u origin main
```

**Note:** You may be prompted to authenticate:
- Use personal access token (Settings → Developer settings → Personal access tokens)
- Or use GitHub CLI: `gh auth login`

### Step 3: Verify Push

Visit `https://github.com/YOUR_USERNAME/safechat` to verify files are uploaded.

---

## Phase 2: Prepare for Vercel Deployment

### Backend Preparation: Vercel Functions (Optional - Production Option)

**Note:** Free Vercel tier has limitations. For production:

#### Option A: Deploy backend to Heroku/Railway (Recommended)

1. **Heroku Deployment:**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   
   # Create app
   heroku create safechat-api
   
   # Set environment variables
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   
   # Push from server directory
   cd server
   git push heroku main
   ```

2. **Railway Deployment:**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repo
   - Set MONGODB_URI, JWT_SECRET environment variables
   - Deploy

#### Option B: Use local backend (Development)

For testing locally, keep backend on `http://localhost:5000`

---

### Frontend Preparation: Vercel (Primary Deployment)

#### Step 1: Prepare Environment Variables

Create `client/.env.production` file:

```
REACT_APP_API_BASE_URL=https://your-backend-url.com
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

Or set these in Vercel dashboard after connecting repo.

#### Step 2: Update Client Package.json

Ensure your `client/package.json` has:

```json
{
  "name": "safechat-client",
  "version": "1.0.0",
  "private": true,
  "proxy": "http://localhost:5000",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.0.0",
    "socket.io-client": "^4.7.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version"]
  }
}
```

#### Step 3: Build and Test Locally

```bash
cd client
npm run build
# Check that build/ directory is created with no errors
```

---

## Phase 3: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub account
   - Click "New Project"

2. **Import Git Repository**
   - Find `safechat` in your repositories
   - Click Import

3. **Configure Project Settings**
   - **Framework Preset:** React
   - **Root Directory:** `./client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Environment Variables**
   - Add `REACT_APP_API_BASE_URL`
   - Add `REACT_APP_SOCKET_URL`
   - Set to your backend URL (or localhost:5000 for testing)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be available at `https://safechat.vercel.app` (or custom domain)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project root
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm project name
# - Confirm directory
# - Set environment variables
# - Deploy
```

---

## Phase 4: Configure Backend for Production

### Setup MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/safechat?retryWrites=true&w=majority
   ```

### Deploy Backend (Recommended: Railway or Heroku)

#### Railway Deployment Steps:

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `safechat` repository
4. Select `server` directory as root
5. Add variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Strong random string (generate: `openssl rand -hex 32`)
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
6. Deploy

#### Get Backend URL:

After deployment, you'll get:
```
https://safechat-api-production.up.railway.app
```

### Update Frontend Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

1. Update `REACT_APP_API_BASE_URL`:
   ```
   https://safechat-api-production.up.railway.app
   ```

2. Update `REACT_APP_SOCKET_URL`:
   ```
   https://safechat-api-production.up.railway.app
   ```

3. Redeploy frontend: "Deployments" → "Redeploy"

---

## Phase 5: Testing Production Deployment

### Checklist

- [ ] Frontend loads at `https://safechat.vercel.app`
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can see other users online
- [ ] Can start conversation with another user
- [ ] Can send and receive messages
- [ ] Message encryption/decryption works
- [ ] Can enable location sharing
- [ ] GPS status shows correctly
- [ ] Can add relatives
- [ ] Can see relative list
- [ ] Can toggle location sharing on/off
- [ ] Can view alert history

### Monitor Logs

**Vercel Frontend Logs:**
```
Dashboard → Deployments → Select latest → Logs
```

**Railway Backend Logs:**
```
Project → server → Logs
```

---

## Phase 6: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Vercel Dashboard → Project Settings → Domains
2. Add domain (e.g., `safechat.your-domain.com`)
3. Follow DNS configuration steps
4. Update backend environment variables with custom domain

---

## Phase 7: Enable HTTPS and Security

### Vercel (Automatic)
- HTTPS enabled by default ✅
- Auto-renews SSL certificates ✅

### Backend (Manual)

If using self-hosted backend:
```bash
# Add to server.js for CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://safechat.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

---

## Troubleshooting

### "Cannot find module" errors on Vercel

**Solution:** Ensure all dependencies are in `client/package.json`:
```bash
cd client
npm install socket.io-client axios react-router-dom
```

### CORS errors in browser console

**Solution:** Update backend CORS configuration:
```javascript
// server.js
const cors = require('cors');
app.use(cors({
  origin: 'https://safechat.vercel.app',
  credentials: true
}));
```

### Socket.IO connection fails

**Solution:** Ensure Socket.IO is properly configured:
```javascript
// server.js
const io = require('socket.io')(server, {
  cors: {
    origin: 'https://safechat.vercel.app',
    methods: ['GET', 'POST']
  }
});
```

### Messages not sending

**Solution:** Check:
1. Backend API URL in frontend .env
2. JWT token is valid
3. MongoDB connection is active
4. Backend logs for errors

### Geolocation not working

**Solution:**
1. Frontend must be on HTTPS (Vercel is ✅)
2. Backend must support geolocation routes
3. Check browser's geolocation permission settings

---

## Quick Command Reference

### Push to GitHub
```powershell
cd "C:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat"
git remote add origin https://github.com/YOUR_USERNAME/safechat.git
git push -u origin main
```

### Deploy Frontend to Vercel
```powershell
npm install -g vercel
vercel
# Follow interactive prompts
```

### Deploy Backend to Railway
```
1. Go to railway.app
2. Connect GitHub account
3. Create new project from GitHub repo
4. Set root directory to "server"
5. Add environment variables
6. Deploy
```

---

## Environment Variables Reference

### Frontend (.env or Vercel)
```
REACT_APP_API_BASE_URL=https://your-backend-url.com
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/safechat
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://safechat.vercel.app
```

---

## Post-Deployment Steps

1. **Monitor Performance**
   - Vercel Analytics
   - MongoDB Atlas metrics
   - Backend uptime monitoring

2. **Set Up CI/CD**
   - Push to GitHub → Auto-deploy to Vercel
   - Already configured by default! ✅

3. **Enable Features**
   - Analytics
   - Performance monitoring
   - Error tracking

4. **Backup Strategy**
   - MongoDB Atlas auto-backups (enabled)
   - GitHub as code backup
   - Regular exports recommended

---

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas:** [docs.mongodb.com](https://docs.mongodb.com/atlas)
- **Socket.IO Deployment:** [socket.io/docs/v4/deployment](https://socket.io/docs/v4/deployment/)

---

## Summary

Your SafeChat application is now ready for production:

✅ Code committed to GitHub  
✅ Frontend ready for Vercel deployment  
✅ Backend ready for Railway/Heroku deployment  
✅ MongoDB Atlas configured  
✅ Environment variables documented  
✅ Deployment guides provided  

**Next Steps:**
1. Create GitHub repository
2. Push code to GitHub
3. Connect GitHub to Vercel
4. Deploy backend to Railway
5. Test production application
6. Monitor logs and performance

**Estimated Deployment Time:** 10-15 minutes

Good luck with your deployment! 🚀

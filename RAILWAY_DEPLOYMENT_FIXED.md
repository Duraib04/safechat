# 🚀 Railway Deployment - Complete Fixed Guide

## ✅ What Was Fixed

Your Railway deployment was failing because it couldn't find the startup script. We've now added:

1. ✅ `server/start.sh` - Startup script for Railway
2. ✅ `server/Procfile` - Process file for deployment
3. ✅ `server/railway.json` - Railway configuration
4. ✅ `railway.json` (root) - Root configuration
5. ✅ All files pushed to GitHub

---

## 🎯 Deploy on Railway - Step-by-Step

### Step 1: Prepare MongoDB Atlas

If you haven't done this yet:

1. Go to https://cloud.mongodb.com
2. Sign up with GitHub
3. Create a cluster (free M0 tier)
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/safechat`
5. **Save this** - you'll need it in next step

### Step 2: Deploy on Railway

1. **Go to:** https://railway.app
2. **Click:** "Start New Project"
3. **Select:** "Deploy from GitHub repo"
4. **Choose your repo:** `Duraib04/safechat`
5. **Railway detects Node.js** - auto-configures ✓

### Step 3: Set Root Directory

When asked "Which directory should I deploy?":

**Type:** `server`

Press Enter.

Railway will now:
- Detect package.json in server/
- Find start.sh and Procfile
- Configure build and start commands automatically

### Step 4: Add Environment Variables

After Railway initializes, go to **Variables** tab:

Add these variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/safechat?retryWrites=true&w=majority

JWT_SECRET = (generate a random 32+ character string)
Example: ABCDEFGHIJKLMNOPQRSTUVWXYZ123456ABCD

NODE_ENV = production

PORT = 5000

CORS_ORIGIN = https://safechat.vercel.app
```

**IMPORTANT NOTES:**
- Replace `username:password` in MONGODB_URI with actual credentials
- Make JWT_SECRET unique and strong (at least 32 characters)
- CORS_ORIGIN should be your Vercel frontend URL

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for deployment (~3-5 minutes)
3. Watch the logs - you should see:
   ```
   npm install
   npm start
   [Server] Express server running on port 5000
   [Database] Connected to MongoDB
   ```

### Step 6: Get Your Backend URL

Once deployed:
1. Click on your deployment
2. Look for the **URL** (looks like: `https://safechat-api-production.up.railway.app`)
3. **Save this** - you'll need it for Vercel

---

## ✅ Verify Railway Deployment

### Check if Backend is Working

Go to your Railway URL + `/api/auth/users`:

```
https://safechat-api-production.up.railway.app/api/auth/users
```

You should see one of:
- **A CORS error** (expected! Frontend not connected yet)
- **A JSON response** with empty array `[]`
- **A 401 Unauthorized** (also expected)

Any of these means the backend is running! ✓

### Check the Logs

In Railway dashboard:
1. Click on your deployment
2. Go to **Logs** tab
3. Look for:
   - `npm install` - dependencies installed
   - `npm start` - server starting
   - `Express server running on port 5000` - server running
   - `Connected to MongoDB` - database connected

---

## 🚨 Troubleshooting Railway Deployment

### Problem: "Build failed - Script not found"

**Solution:** We fixed this! Make sure:
1. You pushed the latest code to GitHub
2. Your deploy includes `server/start.sh` and `server/Procfile`
3. Check in GitHub at: https://github.com/Duraib04/safechat/tree/main/server

### Problem: "Cannot connect to MongoDB"

**Solution:**
1. Verify MONGODB_URI environment variable is set
2. Check MongoDB Atlas credentials (username:password must be correct)
3. Verify database name in connection string
4. Check if IP whitelist allows Railway's IP

**To fix IP whitelist:**
1. Go to MongoDB Atlas
2. Network Access → Add Current IP
3. Or add `0.0.0.0/0` to allow all (dev only!)

### Problem: "Port 5000 is already in use"

**Solution:**
1. This is usually a Railway issue - just redeploy
2. Click "Redeploy" in Railway dashboard
3. It will use a different port automatically

### Problem: "CORS error - Cannot access from Vercel"

**Solution:**
1. Ensure `CORS_ORIGIN` is set to your Vercel URL
2. Example: `https://safechat.vercel.app`
3. Redeploy Railway after changing this variable

### Problem: "Logs show 'Cannot find module'"

**Solution:**
1. Ensure all dependencies are in `server/package.json`
2. Missing packages:
   ```bash
   npm install express mongoose socket.io cors dotenv bcryptjs jsonwebtoken express-validator
   ```
3. Push changes to GitHub
4. Redeploy on Railway

---

## 📊 Expected Railway Logs

Here's what a successful deployment looks like:

```
Building...
npm install
npm WARN deprecated crypto@1.0.1 ...
added 87 packages in 45s

npm start

> safechat-server@1.0.0 start
> node server.js

Server running on port 5000
✓ Express server initialized
✓ Socket.IO configured
Database connection string configured
Waiting for requests...
```

---

## 🔗 Railway URLs

Your backend will be available at:

```
https://safechat-api-production.up.railway.app

API Endpoints:
- Login:     POST /api/auth/login
- Register:  POST /api/auth/register
- Users:     GET /api/auth/users
- Messages:  GET/POST /api/messages/*
- Relatives: GET/POST /api/relatives/*
```

---

## ✅ Next Steps After Railway Deploy

1. **Get your Railway URL** - copy it
2. **Go to Vercel** - add this URL to environment variables
3. **Deploy Vercel** - with Railway URL configured
4. **Test end-to-end** - frontend ↔ backend ↔ MongoDB

---

## 🎯 Quick Redeploy

If something breaks and you need to redeploy:

### Option 1: Redeploy Current Code
1. Railway Dashboard → Deployments
2. Click "Redeploy" on latest version
3. Wait ~3 minutes

### Option 2: Deploy with Code Changes
1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Railway auto-redeploys from GitHub
4. Wait ~3 minutes

### Option 3: Manual Rebuild
1. Railway Dashboard → Variables
2. Change a variable value slightly
3. Save changes
4. This triggers a rebuild

---

## 📞 Still Having Issues?

### Check These First

1. **GitHub has the latest code?**
   - Go to: https://github.com/Duraib04/safechat
   - Check `server/` has `start.sh` and `Procfile`

2. **MongoDB connection string correct?**
   - Test locally: `mongosh "mongodb+srv://..."`
   - Should connect successfully

3. **All environment variables set?**
   - Railway → Variables tab
   - Check: MONGODB_URI, JWT_SECRET, NODE_ENV, CORS_ORIGIN

4. **Logs show clear errors?**
   - Railway → Logs tab
   - Look for error messages
   - Copy error and search online

### Get More Help

1. **Vercel Docs:** https://vercel.com/docs
2. **Railway Docs:** https://docs.railway.app
3. **MongoDB Docs:** https://docs.mongodb.com
4. **Express Docs:** https://expressjs.com

---

## 🎉 You're Good to Go!

Your Railway backend is now configured properly. The next step is to deploy the frontend on Vercel and connect them together.

**Remember your Railway URL:** 
```
https://safechat-api-production.up.railway.app
```

You'll need this for Vercel environment variables!

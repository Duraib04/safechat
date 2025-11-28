# 🎯 START HERE - First Steps

Welcome to SafeChat! Here's exactly what to do next.

---

## ⏱️ 5-Minute Quick Start

### Step 1: Download MongoDB (2 minutes)

**Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Click "Download" (Windows 64-bit MSI)
3. Run installer → Click "Next" → "Install"
4. Click "Complete" 
5. MongoDB now runs automatically

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Start Backend (1 minute)

Open PowerShell/Terminal:
```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat\server
npm install
copy .env.example .env
npm run dev
```

✅ **You should see:**
```
Connected to MongoDB
Server running on port 5000
```

If you see an error about node/npm not found, install Node.js first: https://nodejs.org

### Step 3: Start Frontend (1 minute)

Open a **NEW PowerShell/Terminal** window:
```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat\client
npm install
npm start
```

✅ **Browser automatically opens to:** http://localhost:3000

### Step 4: Create Account (1 minute)

1. Click "Register here"
2. Fill in form:
   - **Username:** john (or any name)
   - **Email:** john@test.com
   - **Password:** test123
3. Click "Register"
4. You're logged in! 🎉

### Step 5: Test with Another Account

1. Open **another browser window** (Incognito if same browser)
2. Go to http://localhost:3000
3. Register different account:
   - **Username:** jane
   - **Email:** jane@test.com
   - **Password:** test123
4. Click on "jane" user → Send message
5. Switch to first window → You got a message! 💬

**That's it!** You now have a working secure messaging app!

---

## 📚 Next: Understand What You Have

Read these in order (10 minutes total):

1. **WELCOME.md** (2 min) - Overview of features
2. **QUICK_REFERENCE.md** (3 min) - Commands and tips
3. **API_DOCUMENTATION.md** (5 min) - How the API works

---

## 🎨 Then: Customize It (15 minutes)

### Change the Colors

File: `client/src/pages/Auth.css`

Find line 6:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Change `#667eea` and `#764ba2` to your colors:
```css
background: linear-gradient(135deg, #FF1493 0%, #FF69B4 100%);
```

Save, and your app updates instantly! (You'll see the change in browser)

### Change App Name

File: `client/public/index.html`

Find: `<title>SafeChat - Secure Messaging</title>`

Change to: `<title>Your App Name Here</title>`

### Change Database Name (Optional)

File: `server/.env`

Change: `MONGODB_URI=mongodb://localhost:27017/safechat`

To: `MONGODB_URI=mongodb://localhost:27017/yourname`

---

## 🚀 Later: Deploy to Live (Optional)

When you're ready to share with others, see **SECURITY.md** for how to deploy.

---

## 🆘 Troubleshooting

### "npm: command not found"
Install Node.js: https://nodejs.org (includes npm)

### "Cannot connect to MongoDB"
1. Check MongoDB is running
2. Windows: Services → Look for "MongoDB Community Server" → Should show "Running"
3. Mac/Linux: Run `mongod` in new terminal

### "Port 5000 already in use"
Open PowerShell:
```bash
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

Replace `<number>` with the number shown.

### "Blank page in browser"
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Make sure backend is running (check first terminal)

### "Can't send messages"
Make sure:
- Backend terminal shows "Server running on port 5000"
- Frontend terminal shows app compiled successfully
- Both windows are from step 1 & 2

---

## ✅ Success Signs

✅ Backend terminal shows:
```
Connected to MongoDB
Server running on port 5000
```

✅ Frontend terminal shows:
```
Compiled successfully!
You can now view safechat-client in the browser.
```

✅ Browser opens to login page

✅ Can create account and see dashboard

✅ Can send messages between two accounts

---

## 📖 Documentation Map

| Need... | Read... |
|---------|---------|
| Quick overview | WELCOME.md |
| Step-by-step setup | SETUP.md |
| Commands & tips | QUICK_REFERENCE.md |
| All API endpoints | API_DOCUMENTATION.md |
| Deploy to production | SECURITY.md |
| Code structure | PROJECT_STRUCTURE.md |
| Full details | README.md |

---

## 💡 Pro Tips

1. **Keep terminals running** - Don't close the backend/frontend terminals
2. **Use two browsers** - Test messaging with two browser windows
3. **Check console** - If something breaks, check browser console (F12)
4. **Mobile testing** - Open http://localhost:3000 on phone for mobile view
5. **Customize later** - Get it working first, customize colors second

---

## 🎓 Understanding the Code (Optional)

Want to learn how it works?

**The Login Flow:**
1. User enters email & password
2. Frontend sends to `/api/auth/login`
3. Backend checks password (hashed with bcryptjs)
4. Backend returns JWT token
5. Frontend saves token and logs in user
6. All future requests include token

**The Message Flow:**
1. User types message and clicks Send
2. Message is encrypted with AES-256
3. Backend stores encrypted version
4. Socket.IO sends real-time notification
5. Recipient receives message via Socket.IO
6. When recipient opens chat, encrypted message is decrypted

**The Real-Time Part:**
1. Both users connect via WebSocket (Socket.IO)
2. When one user sends message, server emits to other user immediately
3. No need to refresh page - message appears instantly

---

## 🔐 Security Note

The encryption and passwords are secure by default. Before deploying to production:

1. Change `JWT_SECRET` in `server/.env`
2. Change `ENCRYPTION_KEY` in `server/.env`
3. Use MongoDB Atlas (cloud) instead of local
4. Enable HTTPS

See SECURITY.md when ready to go live.

---

## 🎉 That's It!

You now have a working secure messaging platform!

**Next steps:**
1. ✅ Run the servers (follow step 1-3 above)
2. ✅ Create test accounts
3. ✅ Send messages
4. ✅ Explore features
5. ✅ Customize colors (optional)
6. ✅ Read more docs if interested
7. ✅ Deploy when ready (SECURITY.md)

---

## 💬 Need Help?

1. **Can't start?** - Check SETUP.md
2. **How to use?** - Check QUICK_REFERENCE.md
3. **API question?** - Check API_DOCUMENTATION.md
4. **Deploy?** - Check SECURITY.md
5. **Code structure?** - Check PROJECT_STRUCTURE.md

---

## 🚀 Ready?

**Open three terminals and run:**

Terminal 1:
```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat\server
npm run dev
```

Terminal 2:
```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat\client
npm start
```

Terminal 3 (optional, only if using local MongoDB):
```bash
mongod
```

**Then:** Go to http://localhost:3000 and start chatting!

---

**Made with ❤️ - Enjoy your secure messaging platform!**

Questions? Check the documentation files above.

---

**Time to get started:** Now! ⏰

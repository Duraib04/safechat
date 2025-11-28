# SafeChat - Quick Start Guide

## What is SafeChat?

SafeChat is a secure, real-time messaging platform designed for couples and partners who value privacy. It features:
- **End-to-End Encryption** - Messages are encrypted before storage
- **Real-Time Chat** - Instant message delivery
- **User Authentication** - Secure login with JWT tokens
- **Online Status** - See when your partner is online
- **Message Privacy** - Delete messages, block users

## System Requirements

- **Node.js** v14 or higher
- **MongoDB** (local installation or MongoDB Atlas cloud)
- **npm** (comes with Node.js)
- **Git** (optional)

## Step 1: Install MongoDB

### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will be installed and running as a Windows service

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

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster
4. Get your connection string
5. Use it in the `.env` file later

## Step 2: Setup Backend Server

1. Open terminal/PowerShell and navigate to the project:
```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
copy .env.example .env
```

4. Edit `.env` with your settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/safechat
JWT_SECRET=your_super_secret_key_change_this_123456
ENCRYPTION_KEY=12345678901234567890123456789012
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

## Step 3: Setup Frontend Client

In a **new terminal**:

1. Navigate to client folder:
```bash
cd c:\Users\durai\OneDrive\Documents\projects\OPERATION\safechat\client
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm start
```

The application will automatically open at http://localhost:3000

## Step 4: Test the Application

1. **Register a New Account:**
   - Click "Register here" link
   - Enter username, email, and password
   - Click "Register" button

2. **Login:**
   - Use the credentials you just created
   - You'll be redirected to the dashboard

3. **Start Chatting:**
   - You'll see "All Users" section in the sidebar
   - Click on any user to start a conversation
   - Type a message and press Send

4. **Test with Multiple Users:**
   - Open another browser window
   - Register a different account
   - Send messages between accounts

## Security Settings to Change Before Production

### 1. JWT Secret
In `server/.env`:
```
JWT_SECRET=generate_a_long_random_string_here
```

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Encryption Key
In `server/.env`:
```
ENCRYPTION_KEY=your_32_character_key_here
```

Must be exactly 32 characters.

### 3. Database
- Change from local MongoDB to MongoDB Atlas for production
- Set strong username/password
- Enable IP whitelisting

### 4. CORS
For production, update the `client.cors.origin` in `server/server.js` to your actual domain.

## Common Issues & Solutions

### "MongoDB Connection Error"
```
Solution:
- Check if MongoDB is running: mongod (Windows/Mac) or systemctl status mongodb (Linux)
- Verify MONGODB_URI in .env is correct
- For MongoDB Atlas, ensure IP whitelist includes your IP
```

### "Port 5000 Already in Use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

### "npm ERR! ERESOLVE unable to resolve dependency tree"
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

### "Cannot find module 'react'"
```bash
# Reinstall in the client directory
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

## Default User Credentials (for Testing)

You can create test accounts with:
- Username: `testuser1`, `testuser2`
- Email: `test1@example.com`, `test2@example.com`
- Password: `password123`

## Environment Variables Explained

```env
PORT=5000                              # Server port
MONGODB_URI=mongodb://localhost:27017/safechat  # Database connection
JWT_SECRET=your_secret               # JWT signing secret (keep secret!)
ENCRYPTION_KEY=32_char_key           # Message encryption key (32 chars exactly)
NODE_ENV=development                 # development or production
CLIENT_URL=http://localhost:3000     # Frontend URL for CORS
```

## Next Steps

1. **Customize the UI:**
   - Edit color scheme in `client/src/pages/Auth.css`
   - Modify dashboard layout in `client/src/pages/Dashboard.css`

2. **Add Features:**
   - Voice/video calling
   - File sharing
   - User profiles
   - Group chats

3. **Deploy:**
   - Backend: Heroku, AWS, DigitalOcean, or Vercel
   - Frontend: Netlify, Vercel, or GitHub Pages
   - Database: MongoDB Atlas

## Useful Commands

```bash
# Backend
cd server
npm run dev        # Start with auto-reload
npm start          # Start normally

# Frontend
cd client
npm start          # Start development server
npm build          # Build for production

# MongoDB
mongod             # Start MongoDB (if installed locally)
mongo              # Connect to MongoDB shell
```

## Support & Troubleshooting

- Check terminal/console for error messages
- Clear browser cache if UI doesn't update
- Ensure both servers are running (backend on 5000, frontend on 3000)
- Check network tab in browser DevTools for API errors

## Security Reminders

⚠️ **Important:**
- Never commit `.env` files to git
- Change default secrets before production
- Use HTTPS in production
- Keep Node.js and dependencies updated
- Use strong passwords for MongoDB

Enjoy secure chatting! 💬❤️

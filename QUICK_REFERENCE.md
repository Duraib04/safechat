# SafeChat - Quick Reference

## Installation (5 Minutes)

```bash
# 1. Backend
cd server
npm install
copy .env.example .env
npm run dev

# 2. Frontend (new terminal)
cd client
npm install
npm start

# 3. MongoDB (new terminal - if using local)
mongod
```

The app opens at `http://localhost:3000`

---

## Key Files to Edit

### Change Theme Colors
File: `client/src/pages/Auth.css` and `client/src/pages/Dashboard.css`
```css
/* Change this gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Server Port
File: `server/.env`
```
PORT=5000
```

### Change Database
File: `server/.env`
```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/safechat

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/safechat
```

### Change Authentication Secret
File: `server/.env`
```
JWT_SECRET=your_secret_key_here_change_this
```

---

## Common Commands

```bash
# Start backend
npm run dev              # With auto-reload (requires nodemon)
npm start              # Start without reload

# Start frontend
npm start              # Development server with hot reload
npm run build          # Production build

# Install dependencies
npm install            # Install all packages
npm install package    # Install specific package

# MongoDB
mongod                 # Start MongoDB (local)
mongo                  # Connect to MongoDB shell
```

---

## Default Test Users

Create these to test:
- **User 1**: username: `john`, email: `john@test.com`, password: `test123`
- **User 2**: username: `jane`, email: `jane@test.com`, password: `test123`

---

## Project URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Base: http://localhost:5000/api
- WebSocket: ws://localhost:5000
- MongoDB: mongodb://localhost:27017

---

## Security Quick Checklist

Before Production:
- [ ] Change JWT_SECRET in `.env`
- [ ] Change ENCRYPTION_KEY in `.env` (32 chars)
- [ ] Use MongoDB Atlas instead of local
- [ ] Enable HTTPS
- [ ] Update CLIENT_URL in `.env`
- [ ] Remove .env from git (use .env.example)
- [ ] Add rate limiting
- [ ] Enable CORS for your domain only
- [ ] Use strong passwords
- [ ] Set NODE_ENV=production

---

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongod

# Check connection string
# mongodb://localhost:27017/safechat
```

### "Port 5000 in use"
```bash
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <number> /F
```

### "Module not found"
```bash
# Reinstall packages
cd server (or client)
rm -rf node_modules
npm install
```

### "CORS Error"
```javascript
// Check server/.env
CLIENT_URL=http://localhost:3000

// Should match frontend URL
```

### "Messages not encrypting"
```bash
# Ensure ENCRYPTION_KEY is 32 characters
# Check env variable is loaded: console.log(process.env.ENCRYPTION_KEY)
```

---

## API Quick Reference

### Register
```bash
POST /api/auth/register
Body: { username, email, password }
```

### Login
```bash
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Send Message
```bash
POST /api/messages/send
Header: Authorization: Bearer <token>
Body: { recipientId, content }
```

### Get Messages
```bash
GET /api/messages/messages/:userId
Header: Authorization: Bearer <token>
```

### Get Conversations
```bash
GET /api/messages/conversations
Header: Authorization: Bearer <token>
```

---

## File Size Reference

```
server/
├── server.js              ~2KB
├── models/               ~4KB
├── routes/               ~8KB
├── middleware/           ~2KB
└── utils/               ~2KB

client/
├── App.js               ~2KB
├── pages/              ~6KB
├── context/            ~4KB
├── components/         ~1KB
└── public/            ~1KB
```

---

## Dependencies Explanation

### Backend
- **express**: Web server framework
- **mongoose**: MongoDB database manager
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Authentication tokens
- **socket.io**: Real-time communication
- **cors**: Cross-origin requests
- **crypto**: Message encryption
- **express-validator**: Input validation
- **dotenv**: Environment variables

### Frontend
- **react**: UI library
- **react-router-dom**: Page navigation
- **axios**: API requests
- **socket.io-client**: Real-time client
- **date-fns**: Date formatting

---

## Directory Tree

```
safechat/
├── server/
│   ├── models/ (3 files)
│   ├── routes/ (2 files)
│   ├── middleware/ (2 files)
│   ├── utils/ (2 files)
│   ├── server.js
│   ├── package.json
│   └── .env (create from .env.example)
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .vscode/
│   └── tasks.json
│
├── README.md
├── SETUP.md
├── SECURITY.md
├── API_DOCUMENTATION.md
├── PROJECT_STRUCTURE.md
└── .gitignore
```

---

## Message Encryption Details

```javascript
// Encryption process
Algorithm: AES-256-CBC
Key Size: 32 bytes (256 bits)
IV Size: 16 bytes (128 bits) - random each time
Format: [IV in hex]:[encrypted in hex]

// Example
Input: "I love you"
Output: "a1b2c3d4e5f6...:[encrypted_hash]"
```

---

## Environment Variable Template

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/safechat

# Authentication
JWT_SECRET=generate_random_secret_key_32_chars

# Encryption
ENCRYPTION_KEY=exactly_32_characters_long

# CORS
CLIENT_URL=http://localhost:3000
```

---

## Performance Tips

1. **Database Indexing**: Already configured in models
2. **Message Pagination**: Implement for large chats
3. **Image Optimization**: Compress profile pictures
4. **Lazy Loading**: Load messages as user scrolls
5. **Caching**: Cache user list
6. **Connection Pooling**: MongoDB handles automatically

---

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Messages encrypt and decrypt
- [ ] Real-time message delivery
- [ ] Online status updates
- [ ] Typing indicators work
- [ ] Message deletion works
- [ ] User blocking works
- [ ] Read status works
- [ ] Logout clears token

---

## File Editing Guide

### Change App Name
1. `client/public/index.html` - Change `<title>`
2. `server/` - Rename database name in MONGODB_URI
3. `README.md` - Update project name

### Add New Feature
1. Create route in `server/routes/`
2. Create model in `server/models/` if needed
3. Create middleware in `server/middleware/` if needed
4. Create component in `client/src/pages/`
5. Add styling in `.css` file
6. Update API documentation

### Deploy to Production
1. Follow SECURITY.md
2. Choose hosting (Heroku, DigitalOcean, AWS)
3. Set environment variables
4. Enable HTTPS
5. Update CORS settings
6. Configure database backups

---

## Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Socket.IO Guide](https://socket.io/docs/)

---

## Git Commands

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Create repo on GitHub and push
git branch -M main
git remote add origin https://github.com/username/safechat.git
git push -u origin main
```

---

## Support & Help

1. **Installation Issues**: See SETUP.md
2. **API Questions**: See API_DOCUMENTATION.md
3. **Security Questions**: See SECURITY.md
4. **Structure Questions**: See PROJECT_STRUCTURE.md
5. **General Info**: See README.md

---

**Quick Links:**
- 📖 Full Docs: README.md
- 🚀 Setup Guide: SETUP.md
- 🔒 Security: SECURITY.md
- 📡 API Docs: API_DOCUMENTATION.md
- 🗂️ Structure: PROJECT_STRUCTURE.md

---

Last Updated: January 2024

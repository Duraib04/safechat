# SafeChat Project Structure

```
safechat/
│
├── .vscode/
│   └── tasks.json                 # VS Code tasks for running servers
│
├── server/                         # Backend Node.js/Express Server
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   ├── Message.js            # Message schema with encryption
│   │   └── Conversation.js       # Conversation schema
│   │
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints (register, login, logout)
│   │   └── messages.js           # Message endpoints (send, receive, delete)
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   └── errorHandler.js       # Global error handling
│   │
│   ├── utils/
│   │   ├── jwt.js                # JWT token generation and verification
│   │   └── encryption.js         # AES-256 message encryption
│   │
│   ├── server.js                 # Main server file with Socket.IO setup
│   ├── package.json              # Server dependencies
│   ├── .env.example              # Environment variables template
│   └── .gitignore
│
├── client/                         # Frontend React Application
│   ├── public/
│   │   └── index.html            # HTML template
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.js # Route protection component
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Authentication context with login/register
│   │   │   └── SocketContext.js  # Real-time socket connection context
│   │   │
│   │   ├── pages/
│   │   │   ├── Auth.js           # Login and Register pages
│   │   │   ├── Auth.css          # Authentication styling
│   │   │   ├── Dashboard.js      # Main chat dashboard
│   │   │   └── Dashboard.css     # Dashboard styling
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │
│   │   ├── App.js                # Main App component with routing
│   │   ├── App.css               # Global styles
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Global CSS
│   │
│   ├── package.json              # Client dependencies
│   └── .gitignore
│
├── README.md                      # Main project documentation
├── SETUP.md                       # Quick start guide
├── SECURITY.md                    # Security & deployment guide
├── API_DOCUMENTATION.md           # Complete API reference
└── .gitignore                     # Root git ignore
```

---

## File Descriptions

### Backend (server/)

#### Models
- **User.js**: Manages user accounts with password hashing and verification
- **Message.js**: Stores encrypted messages with read status tracking
- **Conversation.js**: Tracks conversation threads between users

#### Routes
- **auth.js**: 
  - POST /register - User registration
  - POST /login - User login
  - POST /logout - User logout
  - GET /me - Current user info
  - GET /users - Get all users
  - POST /block/:userId - Block user

- **messages.js**:
  - GET /conversations - Get user's conversations
  - GET /messages/:userId - Get messages with specific user
  - POST /send - Send encrypted message
  - PUT /messages/:messageId/read - Mark as read
  - DELETE /messages/:messageId - Delete message

#### Middleware
- **auth.js**: Validates JWT tokens on protected routes
- **errorHandler.js**: Centralized error handling

#### Utils
- **jwt.js**: Token creation and verification using jsonwebtoken
- **encryption.js**: AES-256-CBC message encryption/decryption

#### server.js
- Express server setup
- MongoDB connection
- Socket.IO real-time events
- CORS configuration
- Error handling

### Frontend (client/)

#### Context
- **AuthContext.js**: 
  - User state management
  - Login/Register/Logout
  - Token management
  
- **SocketContext.js**:
  - Socket.IO connection
  - Real-time event handling
  - Online users tracking
  - Typing indicators

#### Pages
- **Auth.js**: Login and Registration forms
- **Dashboard.js**: Main chat interface with conversations and messages

#### Components
- **ProtectedRoute.js**: Guards routes that require authentication

#### Styling
- Modern gradient-based design
- Responsive layout
- Beautiful animations

---

## Technology Stack Summary

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **crypto** - Node.js cryptography for message encryption
- **express-validator** - Input validation

### Frontend
- **React** 18 - UI library
- **React Router** v6 - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **CSS3** - Styling and animations

---

## Feature Overview

### Security Features
✅ End-to-end message encryption (AES-256)
✅ Password hashing with bcryptjs
✅ JWT authentication (7-day expiration)
✅ User blocking system
✅ Message deletion
✅ Input validation
✅ CORS protection
✅ Secure HTTP headers

### Chat Features
✅ Real-time messaging via Socket.IO
✅ Online/offline status
✅ Typing indicators
✅ Message read status
✅ Message history
✅ Conversation management
✅ Message timestamps
✅ User profiles

### User Experience
✅ Beautiful, intuitive UI
✅ Responsive design
✅ Smooth animations
✅ Real-time updates
✅ Error handling
✅ Loading states
✅ Password confirmation
✅ Account creation

---

## API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* data */ }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

---

## Environment Variables

### Server .env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/safechat
JWT_SECRET=your_secret_key
ENCRYPTION_KEY=32_character_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Ports
- Backend: 5000
- Frontend: 3000
- MongoDB: 27017

---

## Running the Application

### Terminal 1 - Backend
```bash
cd server
npm install
npm run dev
```

### Terminal 2 - Frontend
```bash
cd client
npm install
npm start
```

### Terminal 3 - MongoDB (if local)
```bash
mongod
```

---

## Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  profileImage: String,
  bio: String,
  isOnline: Boolean,
  lastSeen: Date,
  blockedUsers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String,
  encryptedContent: String,
  isRead: Boolean,
  readAt: Date,
  deletedBy: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Conversations Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId],
  lastMessage: ObjectId (ref: Message),
  lastMessageTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Socket.IO Events Flow

```
CLIENT                          SERVER
  |                               |
  |------- userOnline ---------->|
  |                               |
  |<--- userStatusChanged --------|
  |                               |
  |------- sendMessage --------->|
  |                               |
  |<--- receiveMessage ----------|
  |                               |
  |------- typing ------->|
  |                        |
  |<--- userTyping ------|
  |                        |
  |------- stopTyping ---->|
  |                               |
  |<--- userStopTyping ---------|
  |                               |
  |--- disconnect ----->|
  |<--- userStatusChanged --------|
```

---

## Next Steps

1. **Installation**: Follow SETUP.md
2. **Configuration**: Update environment variables
3. **Database**: Set up MongoDB
4. **Development**: Start both servers
5. **Testing**: Create test accounts and chat
6. **Customization**: Modify colors, add features
7. **Deployment**: Deploy to production

---

## Support

- Check README.md for features and setup
- Check SETUP.md for quick start guide
- Check SECURITY.md for production deployment
- Check API_DOCUMENTATION.md for endpoint details

---

Version: 1.0.0
Created: January 2024

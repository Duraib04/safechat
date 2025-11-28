# SafeChat - Secure Messaging Platform for Lovers

A modern, secure, and encrypted messaging platform built with React and Node.js. Perfect for couples who value privacy and security in their communications.

## Features

### Security & Privacy
- **End-to-End Encryption**: All messages are encrypted using AES-256-CBC before being stored
- **JWT Authentication**: Secure token-based authentication system
- **Password Hashing**: Passwords are hashed using bcryptjs
- **User Blocking**: Block unwanted users from messaging
- **Message Privacy**: Messages can be deleted by either party

### Core Features
- **Real-Time Messaging**: Instant message delivery using Socket.IO
- **User Online Status**: See when your loved one is online
- **Typing Indicators**: Know when your partner is typing
- **Message Read Status**: Track message delivery status
- **Conversation History**: View all past conversations
- **Multi-User Support**: Create accounts and chat with multiple contacts

### User Experience
- **Beautiful UI**: Modern, gradient-based interface
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Theme Ready**: Easy to implement
- **Smooth Animations**: Polished interactions

## Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **crypto** - Message encryption

### Frontend
- **React** 18 - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time events
- **CSS3** - Styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
copy .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/safechat
JWT_SECRET=your_secure_secret_key_change_this
ENCRYPTION_KEY=your_32_character_encryption_key_12345
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The client will run on `http://localhost:3000`

## Project Structure

```
safechat/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── messages.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── encryption.js
│   ├── server.js
│   └── package.json
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/
│   │   │   ├── Auth.js
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.js
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users
- `POST /api/auth/block/:userId` - Block a user

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/messages/:userId` - Get messages with specific user
- `POST /api/messages/send` - Send a message
- `PUT /api/messages/:messageId/read` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete a message

## Socket.IO Events

### Client to Server
- `userOnline` - Emit when user comes online
- `sendMessage` - Send a message in real-time
- `typing` - Emit when user starts typing
- `stopTyping` - Emit when user stops typing

### Server to Client
- `userStatusChanged` - User online/offline status
- `receiveMessage` - Receive new message
- `userTyping` - User is typing
- `userStopTyping` - User stopped typing

## Security Considerations

1. **Message Encryption**: All messages are encrypted before storage
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS properly for your domain
4. **JWT Secret**: Use a strong, random JWT secret
5. **Encryption Key**: Use a secure 32-character encryption key
6. **MongoDB Security**: Use strong authentication and IP whitelisting
7. **Rate Limiting**: Consider adding rate limiting in production
8. **Input Validation**: All inputs are validated on both client and server

## Password Requirements
- Minimum 6 characters
- Can contain letters, numbers, and special characters

## Username Requirements
- Minimum 3 characters
- Must be unique

## Future Enhancements

- [ ] Voice/Video calling
- [ ] File sharing
- [ ] Message search
- [ ] Group chats
- [ ] User profiles
- [ ] Two-factor authentication
- [ ] Message expiration (disappearing messages)
- [ ] End-to-end encryption verification
- [ ] Mobile app (React Native)
- [ ] Dark mode theme

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database credentials

### CORS Error
- Ensure `CLIENT_URL` is correctly set in server `.env`
- Check that frontend is running on the specified port

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please create an issue in the repository.

---

Made with ❤️ for secure communications

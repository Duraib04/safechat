# SafeChat API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Request body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "isOnline": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Login User
**POST** `/auth/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00Z"
  }
}
```

### Get Current User
**GET** `/auth/me` ⚠️ Protected

Response (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "profileImage": null,
  "bio": "Lover of secure chats",
  "isOnline": true,
  "lastSeen": "2024-01-15T10:30:00Z",
  "blockedUsers": [],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Logout User
**POST** `/auth/logout` ⚠️ Protected

Response (200):
```json
{
  "message": "Logout successful"
}
```

### Get All Users
**GET** `/auth/users` ⚠️ Protected

Query parameters (optional):
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50)

Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "jane_doe",
    "email": "jane@example.com",
    "profileImage": null,
    "bio": "Hello there",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:35:00Z",
    "blockedUsers": []
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "username": "john_smith",
    "email": "smith@example.com",
    "profileImage": null,
    "bio": "",
    "isOnline": false,
    "lastSeen": "2024-01-15T09:00:00Z",
    "blockedUsers": []
  }
]
```

### Block User
**POST** `/auth/block/:userId` ⚠️ Protected

URL parameters:
- `userId`: The ID of the user to block

Response (200):
```json
{
  "message": "User blocked successfully"
}
```

---

## Message Endpoints

### Get Conversations
**GET** `/messages/conversations` ⚠️ Protected

Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "participants": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "email": "john@example.com"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "username": "jane_doe",
        "email": "jane@example.com"
      }
    ],
    "lastMessage": {
      "_id": "507f1f77bcf86cd799439040",
      "content": "Hi Jane, how are you?",
      "sender": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "lastMessageTime": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z"
  }
]
```

### Get Messages with User
**GET** `/messages/messages/:userId` ⚠️ Protected

URL parameters:
- `userId`: The ID of the other user

Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439040",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "jane_doe",
      "email": "jane@example.com"
    },
    "content": "Hi Jane, how are you?",
    "isRead": true,
    "readAt": "2024-01-15T10:31:00Z",
    "deletedBy": [],
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439041",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "jane_doe",
      "email": "jane@example.com"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "content": "I'm doing great! How about you?",
    "isRead": false,
    "readAt": null,
    "deletedBy": [],
    "createdAt": "2024-01-15T10:32:00Z"
  }
]
```

### Send Message
**POST** `/messages/send` ⚠️ Protected

Request body:
```json
{
  "recipientId": "507f1f77bcf86cd799439012",
  "content": "Hello Jane!"
}
```

Response (201):
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439042",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "jane_doe"
    },
    "content": "Hello Jane!",
    "isRead": false,
    "readAt": null,
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

### Mark Message as Read
**PUT** `/messages/:messageId/read` ⚠️ Protected

URL parameters:
- `messageId`: The ID of the message to mark as read

Response (200):
```json
{
  "message": "Message marked as read"
}
```

### Delete Message
**DELETE** `/messages/:messageId` ⚠️ Protected

URL parameters:
- `messageId`: The ID of the message to delete

Response (200):
```json
{
  "message": "Message deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "param": "email",
      "msg": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Cannot send message to this user"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error during login"
}
```

---

## Socket.IO Events

### Connect Events

#### User Comes Online
```javascript
socket.emit('userOnline', userId);
```

#### Receive User Status Change
```javascript
socket.on('userStatusChanged', (data) => {
  console.log(data); // { userId, status: 'online' | 'offline' }
});
```

### Message Events

#### Send Message in Real-Time
```javascript
socket.emit('sendMessage', {
  senderId: userId,
  recipientId: recipientUserId,
  content: 'Hello!',
  encryptedContent: encryptedString
});
```

#### Receive Message in Real-Time
```javascript
socket.on('receiveMessage', (data) => {
  console.log(data); // { senderId, content, timestamp }
});
```

### Typing Indicators

#### User Starts Typing
```javascript
socket.emit('typing', {
  senderId: userId,
  recipientId: recipientUserId
});
```

#### Receive Typing Notification
```javascript
socket.on('userTyping', (data) => {
  console.log(data); // { userId }
});
```

#### User Stops Typing
```javascript
socket.emit('stopTyping', {
  senderId: userId,
  recipientId: recipientUserId
});
```

#### Receive Stop Typing Notification
```javascript
socket.on('userStopTyping', (data) => {
  console.log(data); // { userId }
});
```

---

## Rate Limiting

Currently not implemented but recommended for production. Consider adding:
- 5 login attempts per 15 minutes
- 100 messages per hour per user
- 10 registrations per hour per IP

## CORS

Currently allows requests from `http://localhost:3000` in development. Update `CLIENT_URL` in `.env` for production.

## Encryption

All messages are encrypted using:
- **Algorithm**: AES-256-CBC
- **Key**: 32-character key (derived from ENCRYPTION_KEY env variable)
- **IV**: Random 16-byte initialization vector

---

## Example: Complete Chat Flow

```javascript
// 1. Register
POST /api/auth/register
Body: { username, email, password }

// 2. Login
POST /api/auth/login
Body: { email, password }
// Receive: token

// 3. Get all users
GET /api/auth/users
Header: Authorization: Bearer <token>

// 4. Get conversations
GET /api/messages/conversations
Header: Authorization: Bearer <token>

// 5. Send message
POST /api/messages/send
Header: Authorization: Bearer <token>
Body: { recipientId, content }

// 6. Get messages with specific user
GET /api/messages/messages/:userId
Header: Authorization: Bearer <token>

// 7. Mark message as read
PUT /api/messages/:messageId/read
Header: Authorization: Bearer <token>

// 8. Logout
POST /api/auth/logout
Header: Authorization: Bearer <token>
```

---

Last Updated: January 2024
Version: 1.0.0

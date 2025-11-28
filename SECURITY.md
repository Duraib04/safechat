# SafeChat - Configuration & Security Guide

## Environment Configuration

### Server Environment Variables (.env)

```env
# Server Port
PORT=5000

# Database Connection
MONGODB_URI=mongodb://localhost:27017/safechat
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safechat?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=change_this_to_a_random_secret_key_in_production

# Encryption Configuration
ENCRYPTION_KEY=12345678901234567890123456789012  # Must be exactly 32 characters

# Environment Mode
NODE_ENV=development  # Set to 'production' in production

# Frontend URL for CORS
CLIENT_URL=http://localhost:3000
```

### Generate Secure Keys

Generate a random JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate a 32-character encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## Database Configuration

### MongoDB Local Setup

**Connection String Format:**
```
mongodb://[username:password@]localhost:27017/database_name
```

**Example (No Authentication):**
```
mongodb://localhost:27017/safechat
```

**Example (With Authentication):**
```
mongodb://admin:mypassword@localhost:27017/safechat
```

### MongoDB Atlas (Cloud) Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new project
3. Create a cluster (select free tier)
4. Create a database user with username and password
5. Whitelist your IP address
6. Get connection string format:

```
mongodb+srv://username:password@cluster0.mongodb.net/safechat?retryWrites=true&w=majority
```

Replace:
- `username`: Your database user
- `password`: Your database password
- `cluster0`: Your cluster name

---

## Security Best Practices

### 1. Password Security

#### Server-Side
- Passwords are hashed with bcryptjs (10 salt rounds)
- Never store plain text passwords
- Hash is performed before saving to database

#### Client-Side
- Never send password in plain text through WebSocket
- Use HTTPS in production to encrypt transmission
- Use password managers

### 2. Message Encryption

Messages are encrypted using AES-256-CBC:

```javascript
// Encryption process
const crypto = require('crypto');
const message = "Secret love message";
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update(message, 'utf8', 'hex');
encrypted += cipher.final('hex');
const result = iv.toString('hex') + ':' + encrypted;
```

### 3. JWT Token Security

Tokens expire after 7 days. Implement token refresh for better security:

```javascript
// Current token expiration
expiresIn: '7d'

// For production, consider:
// accessToken: expiresIn: '15m'
// refreshToken: expiresIn: '7d'
```

### 4. User Blocking

Users can block others to prevent messages:

```javascript
// Check before sending message
if (sender.blockedUsers.includes(recipientId)) {
  // Cannot send
}

// Block user
user.blockedUsers.push(userIdToBlock);
```

### 5. Input Validation

All inputs are validated:

```javascript
// Username validation
body('username')
  .trim()
  .isLength({ min: 3 })
  .withMessage('Username must be at least 3 characters')

// Email validation
body('email')
  .isEmail()
  .withMessage('Please provide a valid email')

// Password validation
body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
```

---

## Production Deployment Guide

### Prerequisites
- Node.js v14+
- MongoDB Atlas account or production MongoDB
- SSL certificate for HTTPS
- Domain name

### Deployment Checklist

- [ ] Change `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Generate strong `ENCRYPTION_KEY`
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure CORS for your domain
- [ ] Set up MongoDB backups
- [ ] Enable database authentication
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Set up CI/CD pipeline

### Deploying Backend (Node.js)

**Option 1: Heroku**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create safechat-server

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set ENCRYPTION_KEY=your_key
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

**Option 2: DigitalOcean**
1. Create a Droplet (Ubuntu 20.04)
2. Install Node.js and MongoDB
3. Clone repository
4. Configure `.env` file
5. Start with PM2:

```bash
npm install -g pm2
pm2 start server.js --name "safechat-server"
pm2 startup
pm2 save
```

**Option 3: AWS EC2**
1. Launch EC2 instance
2. Connect via SSH
3. Install Node.js and MongoDB
4. Follow DigitalOcean steps

### Deploying Frontend (React)

**Build for Production**
```bash
cd client
npm run build
```

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**Option 3: GitHub Pages**
```bash
npm run build
npm install gh-pages --save-dev
```

---

## Monitoring & Logging

### Server Logs
Monitor errors in production:

```javascript
// Add to server.js
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(
  path.join(__dirname, 'app.log'),
  { flags: 'a' }
);

app.use((req, res, next) => {
  const log = `${new Date().toISOString()} ${req.method} ${req.path}\n`;
  logStream.write(log);
  next();
});
```

### Database Monitoring
- Monitor connection pool
- Check slow queries
- Monitor disk space
- Set up backups

### Performance Monitoring
- Use New Relic, DataDog, or similar
- Monitor response times
- Track error rates
- Monitor database queries

---

## Backup & Recovery

### MongoDB Backup

**Local Backup**
```bash
mongodump --db safechat --out ./backup
```

**Restore**
```bash
mongorestore --db safechat ./backup/safechat
```

**Atlas Backup**
- Automatic daily backups (free tier: 7-day retention)
- Manual snapshot backups available
- Configure in Atlas dashboard

---

## Rate Limiting Implementation

Add rate limiting for production security:

```javascript
const rateLimit = require('express-rate-limit');

// Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later'
});

app.post('/api/auth/login', loginLimiter, loginHandler);

// Message limiter
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 messages per hour
  keyGenerator: (req) => req.userId
});

app.post('/api/messages/send', messageLimiter, sendHandler);
```

---

## Database Optimization

### Indexes
Already configured in models:

```javascript
// Message queries optimized
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });

// Conversation lookup
ConversationSchema.index({ participants: 1 });
```

### Query Optimization
- Use `.select()` to exclude password field
- Use `.populate()` efficiently
- Implement pagination for large datasets

---

## Troubleshooting Production Issues

### Issue: Slow Message Loading

**Solution:**
- Check database indexes
- Implement pagination
- Archive old messages
- Optimize query filters

### Issue: High Memory Usage

**Solution:**
- Monitor Socket.IO connections
- Implement connection pooling
- Clear stale data regularly
- Use clustering (Node.js cluster module)

### Issue: CORS Errors

**Solution:**
```javascript
// In server.js
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### Issue: HTTPS Certificate

```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Add to Node.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

---

## Security Audit Checklist

- [ ] All environment variables properly secured
- [ ] No sensitive data in logs
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Authentication required for all protected routes
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] Database authentication enabled
- [ ] Regular security updates applied
- [ ] Backups tested and working
- [ ] Error messages don't leak sensitive info
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention enabled

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security](https://snyk.io/blog/10-react-security-best-practices/)

---

Last Updated: January 2024

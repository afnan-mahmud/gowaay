# 🏨 GoWaay - Room Booking Platform

## 📁 Project Structure

```
GoWaay/
├── gowaay/                    # Frontend (Next.js 14)
│   ├── app/                   # App router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API client
│   └── public/                # Static assets
│
└── gowaay-server/             # Backend (Express + MongoDB)
    ├── src/                   # Source code
    │   ├── controllers/       # Route controllers
    │   ├── models/            # MongoDB models
    │   ├── routes/            # API routes
    │   ├── middleware/        # Express middleware
    │   └── utils/             # Utility functions
    ├── dist/                  # Compiled JavaScript
    └── ecosystem.config.js    # PM2 configuration
```

---

## 🚀 Quick Start

### Development

```bash
# Backend
cd gowaay-server
npm install
npm run dev

# Frontend (in another terminal)
cd gowaay
npm install
npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health

---

## 🏭 Production Deployment

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- PM2 installed globally
- SSL Commerce account (for payments)
- Cloudflare R2 (for image storage)

### Deployment Steps

```bash
# 1. Clone repository
git clone <your-repo>
cd GoWaay/Website

# 2. Install PM2
npm install -g pm2

# 3. Setup Backend
cd gowaay-server
cp env.example .env
# Edit .env with your credentials
npm install --production
npm run build

# 4. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 5. Setup Frontend
cd ../gowaay
cp env.example .env
# Edit .env with your credentials
npm install --production
npm run build
npm start  # Or use PM2 for this too
```

**See [DEPLOYMENT_GUIDE.md](./gowaay-server/DEPLOYMENT_GUIDE.md) for detailed instructions.**

---

## 🛠️ Configuration

### Backend Environment Variables (`gowaay-server/.env`)
```env
# Server
PORT=8080
NODE_ENV=production
BACKEND_URL=https://api.gowaay.com
FRONTEND_URL=https://gowaay.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/

# JWT
JWT_SECRET=your-secret-key

# SSL Commerce (Payment Gateway)
SSL_STORE_ID=your-store-id
SSL_STORE_PASSWD=your-store-password
SSL_IS_LIVE=true
SSL_SUCCESS_URL=https://api.gowaay.com/api/payments/ssl/success
SSL_FAIL_URL=https://api.gowaay.com/api/payments/ssl/fail
SSL_CANCEL_URL=https://api.gowaay.com/api/payments/ssl/cancel
SSL_IPN_URL=https://api.gowaay.com/api/payments/ssl/ipn

# Firebase (Chat)
FIREBASE_PROJECT_ID=gowaay
FIREBASE_CLIENT_EMAIL=your-email@gowaay.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_DATABASE_URL=https://gowaay-default-rtdb.asia-southeast1.firebasedatabase.app

# Cloudflare R2 (Image Storage)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=gowaayimage
R2_PUBLIC_URL=https://images.gowaay.com
```

### Frontend Environment Variables (`gowaay/.env`)
```env
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_IMG_BASE_URL=https://pub-xxxx.r2.dev

# Analytics
NEXT_PUBLIC_FB_PIXEL_ID=your-pixel-id
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your-pixel-id

# Firebase (Chat)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gowaay.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DB_URL=https://gowaay-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gowaay

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

---

## 🔧 Common Commands

### Development
```bash
# Backend
npm run dev        # Start dev server
npm run build      # Build TypeScript
npm run lint       # Lint code
npm test           # Run tests

# Frontend
npm run dev        # Start Next.js dev
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Lint code
```

### Production (PM2)
```bash
pm2 start gowaay-api           # Start server
pm2 stop gowaay-api            # Stop server
pm2 restart gowaay-api         # Restart server
pm2 logs gowaay-api            # View logs
pm2 monit                      # Monitor resources
pm2 status                     # Check status
pm2 save                       # Save configuration
pm2 startup                    # Enable auto-start
```

### Database
```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Seed test data
cd gowaay-server
node seed-data.js
```

---

## 📊 Key Features

### User Features
- ✅ Room search & filtering
- ✅ Instant booking
- ✅ Request booking (host approval)
- ✅ Secure payments (SSLCommerz)
- ✅ Real-time chat
- ✅ Reviews & ratings
- ✅ Booking history
- ✅ Profile management

### Host Features
- ✅ Room listing management
- ✅ Booking calendar
- ✅ Earnings dashboard
- ✅ Payout requests
- ✅ Chat with guests
- ✅ Availability management

### Admin Features
- ✅ Host approval system
- ✅ Room approval system
- ✅ Booking management
- ✅ User management
- ✅ Payment tracking
- ✅ Account ledger
- ✅ Blog management

---

## 🔒 Security Features

### Backend
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Mongoose)
- ✅ XSS protection

### Frontend
- ✅ NextAuth.js authentication
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ Input sanitization
- ✅ Secure API calls

---

## 🚨 Crash Prevention Features

### ✅ Implemented (November 11, 2025)

1. **MongoDB Auto-Reconnection**
   - Retries every 5 seconds on disconnect
   - Connection pooling (2-10 connections)
   - Timeout protection

2. **Global Error Handlers**
   - Catches uncaught exceptions
   - Handles unhandled promise rejections
   - Graceful shutdown

3. **Payment Gateway Protection**
   - 30-second timeout for SSL Commerce
   - Input validation & null checks
   - Automatic retry on failure

4. **PM2 Auto-Recovery**
   - Cluster mode (multi-core)
   - Auto-restart on crash
   - Memory limit monitoring (500MB)
   - Exponential backoff

5. **Database Query Protection**
   - Timeout wrappers
   - Safe query utilities
   - Optimistic locking

**See [CRASH_FIXES.md](./CRASH_FIXES.md) for details.**

---

## 📈 Performance Optimizations

- ✅ Compression middleware
- ✅ Response caching
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Image CDN (Cloudflare R2)
- ✅ Next.js SSR & ISR
- ✅ Rate limiting

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
lsof -i:8080

# Kill process on port
kill -9 $(lsof -ti:8080)

# Check environment variables
cat .env | grep MONGODB_URI
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "your-connection-string"

# Check server logs
pm2 logs gowaay-api --err --lines 50

# Verify .env file
cat gowaay-server/.env
```

### Payment Issues
```bash
# Check SSL Commerce credentials
cat gowaay-server/.env | grep SSL_

# View payment logs
pm2 logs gowaay-api | grep "payment\|SSL"

# Test SSL Commerce API
curl -X POST https://sandbox.sslcommerz.com/gwprocess/v4/api.php
```

### Build Errors
```bash
# Backend
cd gowaay-server
rm -rf dist node_modules
npm install
npm run build

# Frontend  
cd gowaay
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](./gowaay-server/DEPLOYMENT_GUIDE.md) - Production deployment guide
- [CRASH_FIXES.md](./CRASH_FIXES.md) - Crash prevention documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details
- [Backend README](./gowaay-server/README.md) - Backend API documentation
- [Frontend README](./gowaay/README.md) - Frontend documentation

---

## 🧪 Testing

### Manual Testing
```bash
# Test API health
curl http://localhost:8080/health

# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gowaay.com","password":"password123"}'
```

### Load Testing
```bash
# Install Apache Bench
brew install apache-bench  # Mac

# Test API endpoint
ab -n 1000 -c 10 http://localhost:8080/api/rooms/search
```

### Test Credentials
After running `node seed-data.js`:
- Admin: `admin@gowaay.com` / `password123`
- Host: `host@gowaay.com` / `password123`
- Guest: `guest@gowaay.com` / `password123`

---

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Authentication:** NextAuth.js
- **Real-time:** Firebase Realtime Database

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **File Upload:** Multer
- **Payment:** SSLCommerz
- **Image Storage:** Cloudflare R2
- **Process Manager:** PM2

---

## 👥 Team

- **Development:** GoWaay Development Team
- **Design:** UI/UX Team
- **Support:** support@gowaay.com

---

## 📜 License

Proprietary - All rights reserved © 2025 GoWaay

---

## 🔄 Version History

### v1.0.0 (November 11, 2025)
- ✅ Initial production release
- ✅ Complete rebranding from Thaka Jabe to GoWaay
- ✅ Crash prevention system implemented
- ✅ MongoDB auto-reconnection
- ✅ Payment gateway improvements
- ✅ PM2 deployment configuration
- ✅ Comprehensive error handling

---

## 📞 Support

For issues, questions, or support:
- 📧 Email: support@gowaay.com
- 📱 WhatsApp: +8801611553628
- 📍 Address: H-05, R-13, Nikunja-02, Dhaka, Bangladesh
- 🌐 Website: https://gowaay.com
- 📘 Facebook: https://www.facebook.com/gowaay.official
- 📷 Instagram: https://www.instagram.com/gowaay.official

---

**🚀 Status:** Production Ready
**📊 Stability:** High
**🔒 Security:** Enabled
**⚡ Performance:** Optimized

**Last Updated:** November 11, 2025


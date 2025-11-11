# GoWaay Server - Production Deployment Guide

## 🚀 Quick Fix Summary

I've fixed the following crash issues in your production server:

### 1. ✅ MongoDB Auto-Reconnection
- Added automatic reconnection if MongoDB connection is lost
- Configured connection pooling (min: 2, max: 10 connections)
- Added connection timeout and socket timeout settings
- Server will retry connection every 5 seconds instead of crashing

### 2. ✅ Global Error Handlers
- Added `uncaughtException` handler
- Added `unhandledRejection` handler
- Prevents server crashes from unhandled errors

### 3. ✅ Payment Gateway Improvements
- Added 30-second timeout for SSLCommerz API calls
- Added validation for missing/null user data
- Added fallback values to prevent crashes
- Better error logging for debugging

### 4. ✅ PM2 Configuration
- Created `ecosystem.config.js` for production deployment
- Auto-restart on crashes
- Memory limit monitoring (500MB)
- Cluster mode for better performance
- Exponential backoff for restart delays

---

## 📋 Deployment Steps

### 1. Install PM2 (if not already installed)
```bash
npm install -g pm2
```

### 2. Build the Project
```bash
cd /Users/afnanmahmud/Documents/GoWaay/Website/gowaay-server
npm run build
```

### 3. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
```

### 4. Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

### 5. Monitor Server
```bash
# View logs
pm2 logs gowaay-api

# Monitor in real-time
pm2 monit

# Check status
pm2 status
```

---

## 🔍 Troubleshooting

### If Server Keeps Crashing:

1. **Check Logs:**
```bash
pm2 logs gowaay-api --lines 100
```

2. **Check Environment Variables:**
```bash
pm2 env 0
```

3. **Restart Server:**
```bash
pm2 restart gowaay-api
```

4. **View Error Logs:**
```bash
tail -f /Users/afnanmahmud/Documents/GoWaay/Website/gowaay-server/logs/err.log
```

### Common Issues:

#### Issue: "MONGODB_URI not defined"
**Solution:** Make sure `.env` file exists and has `MONGODB_URI` set.

#### Issue: "SSL_STORE_ID not defined"
**Solution:** Make sure all SSLCommerz environment variables are set:
- `SSL_STORE_ID`
- `SSL_STORE_PASSWD`
- `SSL_SUCCESS_URL`
- `SSL_FAIL_URL`
- `SSL_CANCEL_URL`
- `SSL_IPN_URL`

#### Issue: "Payment gateway timeout"
**Solution:** 
- Check if SSLCommerz API is accessible from your server
- Verify your SSL credentials are correct
- Check server firewall settings

#### Issue: "Memory leak"
**Solution:**
- PM2 will auto-restart if memory exceeds 500MB
- Check for memory leaks in your code
- Increase `max_memory_restart` in `ecosystem.config.js`

---

## 📊 Monitoring

### View Real-Time Metrics:
```bash
pm2 monit
```

### View Dashboard:
```bash
pm2 web
# Opens on http://localhost:9615
```

### Check Restart Count:
```bash
pm2 status
# If restart count is high, check logs
```

---

## 🔐 Security Best Practices

### 1. Use Environment Variables
Never commit `.env` files. Use:
```bash
cp env.example .env
# Edit .env with your production values
```

### 2. Enable HTTPS
Make sure your reverse proxy (Nginx/Apache) handles HTTPS.

### 3. Regular Updates
```bash
npm audit fix
npm update
```

### 4. Database Backups
Set up automatic MongoDB backups:
```bash
# Example backup command
mongodump --uri="your-mongodb-uri" --out=/path/to/backup
```

---

## 🚨 Emergency Recovery

### If Server is Down:

1. **Stop PM2:**
```bash
pm2 stop gowaay-api
```

2. **Check what went wrong:**
```bash
pm2 logs gowaay-api --err --lines 50
```

3. **Fix the issue, then restart:**
```bash
pm2 restart gowaay-api
```

### If Database is Unreachable:

The server will now automatically retry connection every 5 seconds.
Check your MongoDB Atlas/server status.

---

## 📈 Performance Tips

1. **Use Cluster Mode:**
   - Already configured in `ecosystem.config.js`
   - Uses all available CPU cores

2. **Monitor Memory:**
   - PM2 auto-restarts at 500MB
   - Adjust in `ecosystem.config.js` if needed

3. **Enable Gzip Compression:**
   - Already enabled in the code
   - Reduces response sizes

4. **Use CDN for Static Files:**
   - You're using Cloudflare R2 ✅

---

## 📝 Useful PM2 Commands

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop gowaay-api

# Restart
pm2 restart gowaay-api

# Delete
pm2 delete gowaay-api

# Logs
pm2 logs gowaay-api

# Clear logs
pm2 flush

# Save configuration
pm2 save

# Resurrect saved processes
pm2 resurrect
```

---

## 🆘 Support

If you continue to experience crashes:

1. Check the error logs
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Test SSLCommerz credentials
5. Check server firewall/security groups

The server now has comprehensive error handling and will:
- Auto-reconnect to MongoDB
- Retry failed connections
- Log all errors
- Auto-restart on crashes
- Handle timeouts gracefully

---

## ✅ Post-Deployment Checklist

- [ ] `.env` file is configured with production values
- [ ] MongoDB connection is working
- [ ] SSLCommerz credentials are correct
- [ ] PM2 is running (`pm2 status`)
- [ ] Server is accessible (`curl http://localhost:8080/health`)
- [ ] Logs directory exists (`mkdir -p logs`)
- [ ] PM2 startup script is configured (`pm2 startup`)
- [ ] Configuration is saved (`pm2 save`)

---

**Version:** 1.0
**Last Updated:** November 11, 2025


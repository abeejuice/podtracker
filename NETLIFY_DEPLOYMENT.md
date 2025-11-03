# 🚀 Netlify Deployment Guide for POD Tracker

## Overview

This guide explains how to deploy the POD Tracker full-stack application to Netlify using serverless functions. The deployment includes:

- **Frontend**: React + Vite app served as static files
- **Backend**: Express API running as a Netlify serverless function
- **Database**: MongoDB Atlas (existing setup)

---

## 📋 Prerequisites

1. **Netlify Account** - Sign up at https://netlify.com (free tier is fine)
2. **MongoDB Atlas** - Your existing MongoDB connection string
3. **Git Repository** - Push your code to GitHub/GitLab/Bitbucket
4. **Netlify CLI** (optional, for local testing):
   ```bash
   npm install -g netlify-cli
   ```

---

## 🔧 What Changed in the Codebase

### New Files Created

1. **`backend/app.js`** - Express app configuration (split from server.js)
   - Exports `buildApp()` function used by both local server and Netlify
   - Includes CORS configuration, middleware, routes, and error handling
   - Adds request logging for debugging

2. **`netlify/functions/api.js`** - Serverless function wrapper
   - Wraps Express app using `serverless-http`
   - Caches handler between Lambda invocations (warm starts)
   - Comprehensive error logging

3. **`netlify.toml`** - Netlify configuration
   - Build commands and settings
   - Redirects `/api/*` to serverless function
   - SPA routing fallback
   - Security headers

4. **`frontend/.gitignore`** - Frontend exclusions
5. **`frontend/.env.example`** - Environment variable template
6. **`frontend/.env.local`** - Local development configuration

### Modified Files

1. **`backend/server.js`**
   - Now imports from `app.js` instead of defining everything
   - Only used for local development (`npm run dev`)
   - Better logging and error messages

2. **`backend/config/db.js`**
   - **CRITICAL FIX**: Added connection caching for serverless
   - Removed `process.exit(1)` (incompatible with Lambda)
   - Added connection event listeners
   - Better error logging with details
   - Configurable timeouts for faster failures

3. **`frontend/src/api/apiClient.js`**
   - **CRITICAL FIX**: Changed baseURL from `'http://localhost:4000'` to `''`
   - Now uses environment variable `VITE_API_BASE_URL`
   - Development: `http://localhost:4000`
   - Production: Empty string (uses relative paths)
   - Added timeout configuration

4. **`backend/package.json`**
   - Added dependencies: `serverless-http` and `@netlify/functions`

---

## 🚀 Deployment Steps

### Step 1: Push Code to Git

```bash
# Initialize git if not already done
cd "/Users/apple/Desktop/POD tracker"
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Netlify deployment with serverless functions"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/pod-tracker.git

# Push to GitHub/GitLab/Bitbucket
git push -u origin main
```

### Step 2: Create Netlify Site

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your POD Tracker repository
5. Netlify should auto-detect settings from `netlify.toml`, but verify:
   - **Build command**: `npm install --prefix frontend && npm run build --prefix frontend`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`

### Step 3: Configure Environment Variables

In Netlify dashboard → **Site configuration** → **Environment variables**, add:

#### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/pod-tracker` | Your MongoDB Atlas connection string |

#### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Automatically set by Netlify |
| `FRONTEND_URL` | `https://your-site.netlify.app` | Your Netlify URL (for CORS) |

⚠️ **IMPORTANT**: Never commit `.env` files with real credentials!

### Step 4: Deploy

Click **"Deploy site"** in Netlify dashboard.

Netlify will:
1. Install frontend dependencies
2. Build React app with Vite
3. Bundle serverless function
4. Deploy everything

### Step 5: Verify Deployment

1. **Health Check**: Visit `https://your-site.netlify.app/`
   - Should redirect to function and show React app

2. **API Health**: Visit `https://your-site.netlify.app/api/patients`
   - Should return `[]` or your patient list
   - **Note**: The first request may be slow (cold start)

3. **Test Full App**:
   - Open your Netlify URL
   - Add a patient
   - Verify POD calculation works

---

## 🧪 Local Testing with Netlify CLI

Before deploying, test the serverless function locally:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to project root
cd "/Users/apple/Desktop/POD tracker"

# Link to your Netlify site (optional)
netlify link

# Start Netlify dev server
netlify dev
```

This will:
- Build the frontend
- Run the serverless function locally
- Serve everything on `http://localhost:8888`

Test:
- `http://localhost:8888/` - React app
- `http://localhost:8888/api/patients` - API endpoint

---

## 🔍 Understanding the Architecture

### Request Flow (Production)

```
User Browser
    ↓
https://your-site.netlify.app/api/patients
    ↓
[Netlify CDN] - Checks netlify.toml redirects
    ↓
Redirect: /api/* → /.netlify/functions/api/:splat
    ↓
[AWS Lambda] - netlify/functions/api.js
    ↓
Check cache: cachedHandler exists?
    ├─ YES → Use cached Express app (warm start ~100ms)
    └─ NO  → Build Express app (cold start ~2-3s)
         ↓
         buildApp() in backend/app.js
         ↓
         connectDb() in backend/config/db.js
         ↓
         Check cache: cachedConnection exists?
         ├─ YES → Reuse MongoDB connection
         └─ NO  → Connect to MongoDB Atlas
    ↓
Express handles request
    ↓
MongoDB query
    ↓
Response sent back to user
```

### File Structure After Deployment

```
POD tracker/
├── backend/
│   ├── app.js              ✨ NEW - Express app builder
│   ├── server.js           🔄 MODIFIED - Local dev only
│   ├── config/
│   │   └── db.js          🔄 MODIFIED - Added caching
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── package.json       🔄 MODIFIED - Added serverless deps
├── frontend/
│   ├── src/
│   │   └── api/
│   │       └── apiClient.js  🔄 MODIFIED - Fixed baseURL
│   ├── .env.local         ✨ NEW - Local dev config
│   ├── .env.example       ✨ NEW - Template
│   └── .gitignore         ✨ NEW - Frontend exclusions
├── netlify/
│   └── functions/
│       └── api.js         ✨ NEW - Serverless wrapper
├── netlify.toml           ✨ NEW - Netlify config
└── NETLIFY_DEPLOYMENT.md  ✨ NEW - This file
```

---

## ⚡ Performance Considerations

### Cold Starts vs Warm Starts

**Cold Start** (first request or after inactivity):
- Lambda container starts
- Node.js loads
- `buildApp()` runs
- MongoDB connects
- **Time**: ~2-5 seconds

**Warm Start** (subsequent requests):
- Cached handler reused
- MongoDB connection reused
- **Time**: ~100-300ms

### Optimization Strategies

1. **Connection Caching** ✅ Implemented
   - Reuses MongoDB connections across requests
   - Significantly reduces latency

2. **Handler Caching** ✅ Implemented
   - Reuses Express app between invocations
   - Avoids rebuilding middleware

3. **Timeout Configuration** ✅ Implemented
   - MongoDB: 5s server selection timeout
   - Axios: 10s request timeout
   - Netlify Functions: 10s max (free tier)

---

## 🐛 Troubleshooting

### Issue: 502 Bad Gateway

**Cause**: Function timeout or crash

**Solutions**:
1. Check Netlify function logs: Site → Functions → api
2. Verify `MONGO_URI` is set correctly
3. Check MongoDB Atlas IP allowlist includes `0.0.0.0/0`
4. Look for error logs in Netlify dashboard

### Issue: CORS Errors

**Cause**: Frontend can't reach API

**Solutions**:
1. Verify `netlify.toml` redirects are configured
2. Check browser network tab for actual request URL
3. Add `FRONTEND_URL` environment variable in Netlify
4. Clear browser cache

### Issue: Cannot find module errors

**Cause**: Dependencies not installed in function

**Solutions**:
1. Verify `serverless-http` and `@netlify/functions` are in `backend/package.json`
2. Check Netlify build logs for errors
3. Ensure ES module imports use `.js` extensions

### Issue: MongoDB connection errors

**Cause**: Connection string or network issues

**Solutions**:
1. Verify `MONGO_URI` is correct (no typos)
2. Check MongoDB Atlas:
   - IP Allowlist: Add `0.0.0.0/0` (allows all IPs)
   - Database user has correct permissions
3. Test connection locally first
4. Check function logs for detailed error messages

### Issue: Environment variables not working

**Cause**: Not set in Netlify or wrong scope

**Solutions**:
1. Go to Netlify dashboard → Site settings → Environment variables
2. Ensure variables are set for "Production" scope
3. Redeploy after adding variables
4. Check spelling (case-sensitive)

---

## 📊 Monitoring and Logging

### View Logs

1. **Real-time logs**:
   ```bash
   netlify functions:log api --stream
   ```

2. **Netlify Dashboard**:
   - Site → Functions → api
   - Click on recent invocations

### What to Monitor

- **Cold start frequency** - Should decrease over time
- **Error rates** - Check for failed requests
- **Response times** - Should be <500ms for warm starts
- **MongoDB connection issues** - Watch for timeouts

### Log Levels

The codebase includes comprehensive logging:

- `🚀` - Server/function starting
- `✅` - Success (connection, request complete)
- `🔄` - Processing (connecting, building)
- `⚠️` - Warning (disconnect, graceful shutdown)
- `❌` - Error (connection failed, request failed)
- `📥` - Incoming request
- `📤` - Outgoing response
- `♻️` - Reusing cached resource (warm start)
- `🥶` - Cold start detected

---

## 🔐 Security Best Practices

### ✅ Implemented

1. **Environment Variables**: Sensitive data (MongoDB URI) not in code
2. **CORS Configuration**: Restricts origin in production (if `FRONTEND_URL` set)
3. **Security Headers**: Added in `netlify.toml`
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: enabled
4. **Input Validation**: Mongoose schema validation
5. **Error Messages**: Sanitized in production (no stack traces)

### 🔒 Recommended Additions

1. **Rate Limiting**: Add to prevent abuse
   ```bash
   npm install express-rate-limit
   ```

2. **JWT Authentication**: For multi-user support
   ```bash
   npm install jsonwebtoken
   ```

3. **MongoDB Network Restrictions**:
   - Change from `0.0.0.0/0` to specific Netlify IP ranges
   - Harder to maintain but more secure

4. **Environment-specific CORS**:
   - Add `FRONTEND_URL` to Netlify env vars
   - Set to your Netlify site URL

---

## 💰 Cost Estimate (Netlify Free Tier)

| Resource | Free Tier Limit | POD Tracker Usage |
|----------|----------------|-------------------|
| Function invocations | 125,000/month | ~1,000/month (light usage) ✅ |
| Function runtime | 100 hours/month | ~1-2 hours/month ✅ |
| Bandwidth | 100 GB/month | <1 GB/month ✅ |
| Build minutes | 300 minutes/month | ~5 min/deploy ✅ |

**Estimate**: Should stay well within free tier for personal/small team use.

MongoDB Atlas free tier (M0):
- Storage: 512 MB
- Shared RAM
- Should be sufficient for hundreds of patients

---

## 🎯 Next Steps

### Immediate

1. ✅ Deploy to Netlify
2. ✅ Test all CRUD operations
3. ✅ Verify POD calculation
4. ✅ Monitor logs for first few days

### Future Enhancements

1. **Custom Domain**: Add your own domain in Netlify
2. **SSL Certificate**: Automatically provided by Netlify
3. **Staging Environment**: Create separate branch for testing
4. **CI/CD Pipeline**: Auto-deploy on git push (default with Netlify)
5. **Analytics**: Add monitoring (e.g., Sentry for error tracking)
6. **Backup Strategy**: Set up MongoDB Atlas automated backups

---

## 📚 Additional Resources

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [serverless-http Library](https://github.com/dougmoscrop/serverless-http)
- [MongoDB Atlas IP Allowlist](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] Code pushed to Git repository
- [ ] `MONGO_URI` added to Netlify environment variables
- [ ] MongoDB Atlas IP allowlist includes `0.0.0.0/0`
- [ ] Local testing completed (`netlify dev`)
- [ ] Frontend builds successfully (`npm run build --prefix frontend`)
- [ ] Backend dependencies installed (`backend/node_modules` has `serverless-http`)
- [ ] `.env` files NOT committed to Git
- [ ] `netlify.toml` exists at project root
- [ ] All changes committed and pushed

---

## 🆘 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review Netlify function logs
3. Test locally with `netlify dev`
4. Check MongoDB Atlas connection
5. Verify environment variables in Netlify dashboard

---

**Last Updated**: 2025-11-03

**Version**: 1.0.0

**Status**: ✅ Ready for deployment

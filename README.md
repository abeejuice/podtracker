# 🧮 POD Tracker - Post-Operative Day Tracker

A lightweight app for doctors to track patients and automatically calculate Post-Operative Days (POD) based on surgery dates.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works)
- npm or yarn

### Step 1: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```
   PORT=4000
   MONGO_URI=your_mongodb_atlas_connection_string
   ```
   *(You've already done this!)*

4. Start the backend server:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   Connected to MongoDB
   POD Tracker API running on port 4000
   ```

5. Test the API:
   - Open `http://localhost:4000` in your browser - should show `{"status":"ok","service":"POD Tracker API"}`
   - Or test with: `curl http://localhost:4000/api/patients` (should return `[]`)

### Step 2: Frontend Setup

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend dev server:
   ```bash
   npm run dev
   ```

4. The app will open in your browser (usually `http://localhost:5173`)

### Step 3: Test the App

1. Click **"+ Add Patient"**
2. Fill in the required fields:
   - Name: `John Doe`
   - MRN: `12345`
   - OT Date: Select a date (try a few days ago)
3. Click **"Save Patient"**
4. You should see the patient in the list with the POD calculated automatically!

## 📁 Project Structure

```
POD tracker/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── patientController.js  # CRUD logic + POD calculation
│   ├── models/
│   │   └── patientModel.js    # Patient schema
│   ├── routes/
│   │   └── patientRoutes.js   # API endpoints
│   ├── utils/
│   │   └── dateUtils.js       # POD calculation helper
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/           # Main screens
│   │   ├── components/        # Reusable components
│   │   ├── api/              # API client
│   │   ├── utils/            # Helper functions
│   │   └── styles/           # Theme
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients (with POD) |
| POST | `/api/patients` | Create new patient |
| GET | `/api/patients/:id` | Get single patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |

## ✨ Features

- ✅ Add patients with OT dates
- ✅ Automatic POD calculation (updated in real-time)
- ✅ View patient list with current POD
- ✅ Delete patients
- ✅ Modern, clean UI
- ✅ Responsive design

## 🐛 Troubleshooting

**Backend won't start:**
- Check your `.env` file has `MONGO_URI` set correctly
- Make sure MongoDB Atlas IP whitelist includes your IP (or `0.0.0.0/0` for development)
- Verify the connection string format

**Frontend can't connect to backend:**
- Make sure backend is running on port 4000
- Check browser console for errors
- Verify CORS is enabled (it is by default)

**POD shows negative numbers:**
- This means the OT date is in the future (normal for testing)
- POD = 0 means surgery was today
- POD > 0 means days since surgery

## 📝 Notes

- POD is calculated dynamically (not stored in database)
- Each time you view the list, POD is recalculated from current date
- MongoDB connection uses environment variables for security

## 🚂 Railway Deployment

Your backend is already configured for Railway! Here's how to deploy:

### Backend Setup on Railway

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Link to Railway project**:
   ```bash
   railway link
   ```

4. **Get MongoDB URI from Railway**:
   - Go to Railway dashboard → Your project → MongoDB service
   - Copy the connection string (should look like: `mongodb://mongo:...@yamanote.proxy.rlwy.net:13214/...`)

5. **Add environment variable in Railway**:
   - Railway dashboard → Your backend service → Variables
   - Add: `MONGO_URI` = `[paste your Railway MongoDB URI]`
   - Railway automatically sets `PORT`, so no need to set that

6. **Deploy**:
   ```bash
   railway up
   ```

   Railway will:
   - Build your Node app
   - Run `npm start` (defined in `package.json`)
   - Inject `MONGO_URI` from environment variables
   - Your app connects to Railway MongoDB ✅

7. **Get your backend URL**:
   - Railway dashboard → Backend service → Settings → Domains
   - Copy the public URL (e.g., `https://your-app.railway.app`)

### Frontend Setup (Netlify/Vercel)

1. **Set environment variable**:
   - In Netlify/Vercel dashboard → Your frontend project → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-app.railway.app` (your Railway backend URL)

2. **Deploy frontend**:
   ```bash
   cd frontend
   npm run build
   # Then deploy the `dist` folder to Netlify/Vercel
   ```

### Verification

- Backend health check: `https://your-app.railway.app/` should return `{"status":"ok","service":"POD Tracker API"}`
- Test API: `https://your-app.railway.app/api/patients` should return `[]`
- Frontend should now connect to Railway backend automatically

## 🎯 Next Steps (Optional Enhancements)

- [ ] Edit patient functionality
- [ ] Search/filter patients
- [ ] Sort by POD, name, or date
- [ ] JWT authentication for multi-doctor use
- [ ] Export patient data

---

**Built with:** React, Express, MongoDB, Node.js


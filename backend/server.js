/**
 * Local development server
 * This file is ONLY used for local development (npm run dev)
 * For production on Netlify, see netlify/functions/api.js
 */
import dotenv from 'dotenv';
import { buildApp } from './app.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';
const FRONTEND_URL = process.env.FRONTEND_URL || '';

/**
 * Start the local development server
 */
async function start() {
  try {
    console.log('🚀 Starting POD Tracker API (Local Development)...');
    console.log('   Environment:', process.env.NODE_ENV || 'development');
    console.log('   Port:', PORT);

    // Build Express app with configuration
    const app = await buildApp({
      mongoUri: MONGO_URI,
      frontendUrl: FRONTEND_URL
    });

    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ POD Tracker API running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/`);
      console.log(`   Patients API: http://localhost:${PORT}/api/patients`);
      console.log('');
      console.log('Press Ctrl+C to stop');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('   Please check your .env file and MongoDB connection');
    process.exit(1);
  }
}

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
start();




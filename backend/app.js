import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import patientRoutes from './routes/patientRoutes.js';

/**
 * Build and configure Express application
 * This function is used by both local server (server.js) and Netlify Functions
 *
 * @param {Object} options - Configuration options
 * @param {string} options.mongoUri - MongoDB connection string
 * @param {string} options.frontendUrl - Frontend URL for CORS (optional)
 * @returns {Promise<express.Application>} Configured Express app
 */
export async function buildApp(options = {}) {
  const { mongoUri, frontendUrl } = options;

  // Connect to MongoDB (with caching for serverless)
  try {
    await connectDb(mongoUri || process.env.MONGO_URI);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error; // Let the caller handle this
  }

  const app = express();

  // CORS configuration - more restrictive in production
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' && frontendUrl
      ? frontendUrl
      : '*',
    credentials: true
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json());

  // Request logging middleware for debugging
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'POD Tracker API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API routes
  app.use('/api/patients', patientRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      availableRoutes: [
        'GET /',
        'GET /api/patients',
        'POST /api/patients',
        'GET /api/patients/:id',
        'PUT /api/patients/:id',
        'DELETE /api/patients/:id'
      ]
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production'
        ? 'An error occurred processing your request'
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  return app;
}

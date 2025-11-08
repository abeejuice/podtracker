/**
 * POD Tracker API - Single File Serverless Function
 * All code in one file to avoid import/bundling issues
 */

import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// ============================================================================
// DATABASE CONNECTION (with caching)
// ============================================================================

let cachedConnection = null;

async function connectDb(mongoUri) {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // Validate MongoDB URI
  if (!mongoUri) {
    const error = new Error('MONGO_URI not set in environment variables');
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');

    // Configure mongoose
    mongoose.set('strictQuery', true);

    // Connect with proper options
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Cache the connection
    cachedConnection = mongoose.connection;

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      cachedConnection = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    console.log('✅ MongoDB connected successfully');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    cachedConnection = null;
    throw err;
  }
}

// ============================================================================
// MONGOOSE MODEL
// ============================================================================

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mrn: { type: String, required: true, trim: true },
    surgeryType: { type: String, default: '', trim: true },
    otDate: { type: Date, required: true },
    surgeon: { type: String, default: '', trim: true },
    unit: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

patientSchema.index({ mrn: 1 }, { unique: false });

// Use existing model if already compiled, otherwise create new
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getPOD(otDateInput) {
  if (!otDateInput) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const otDate = new Date(otDateInput);
  otDate.setHours(0, 0, 0, 0);
  const diffMs = today - otDate;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================================================
// CONTROLLER FUNCTIONS
// ============================================================================

async function createPatient(req, res) {
  try {
    const { name, mrn, surgeryType, otDate, surgeon, unit } = req.body;
    if (!name || !mrn || !otDate) {
      return res.status(400).json({ message: 'name, mrn, and otDate are required' });
    }
    const patient = await Patient.create({ name, mrn, surgeryType, otDate, surgeon, unit });
    const json = patient.toObject();
    json.pod = getPOD(json.otDate);
    res.status(201).json(json);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create patient', error: err.message });
  }
}

async function getPatients(req, res) {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    const withPod = patients.map((p) => {
      const obj = p.toObject();
      obj.pod = getPOD(obj.otDate);
      return obj;
    });
    res.json(withPod);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
}

async function getPatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const obj = patient.toObject();
    obj.pod = getPOD(obj.otDate);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient', error: err.message });
  }
}

async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const patient = await Patient.findByIdAndUpdate(id, updates, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const obj = patient.toObject();
    obj.pod = getPOD(obj.otDate);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update patient', error: err.message });
  }
}

async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete patient', error: err.message });
  }
}

// ============================================================================
// EXPRESS APP BUILDER
// ============================================================================

async function buildApp() {
  // Connect to MongoDB
  await connectDb(process.env.MONGO_URI);

  const app = express();

  // CORS
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // Body parsing
  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'POD Tracker API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  });

  // Patient routes
  app.post('/api/patients', createPatient);
  app.get('/api/patients', getPatients);
  app.get('/api/patients/:id', getPatient);
  app.put('/api/patients/:id', updatePatient);
  app.delete('/api/patients/:id', deletePatient);

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
      message: 'An error occurred processing your request',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  return app;
}

// ============================================================================
// NETLIFY FUNCTION HANDLER (with caching)
// ============================================================================

let cachedHandler = null;

export const handler = async (event, context) => {
  // Configure context for optimal Lambda behavior
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Build handler on first invocation (cold start)
    if (!cachedHandler) {
      console.log('🥶 Cold start - Building Express app...');
      const startTime = Date.now();

      const app = await buildApp();
      cachedHandler = serverless(app);

      const duration = Date.now() - startTime;
      console.log(`✅ Handler built successfully in ${duration}ms`);
    } else {
      console.log('♻️  Using cached handler (warm start)');
    }

    // Log incoming request
    console.log(`📥 ${event.httpMethod} ${event.path}`);

    // Execute the request
    const response = await cachedHandler(event, context);

    // Log response status
    console.log(`📤 Response: ${response.statusCode}`);

    return response;
  } catch (error) {
    // Comprehensive error logging
    console.error('❌ Function execution error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      event: {
        method: event.httpMethod,
        path: event.path
      }
    });

    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An error occurred processing your request',
        requestId: context.awsRequestId,
        timestamp: new Date().toISOString()
      })
    };
  }
};

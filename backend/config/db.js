import mongoose from 'mongoose';

/**
 * Cached connection for serverless environments
 * Prevents creating new connections on every Lambda invocation
 */
let cachedConnection = null;

/**
 * Connect to MongoDB with connection caching for serverless
 *
 * In serverless environments (like Netlify Functions), we cache the connection
 * to avoid reconnecting on every invocation, which improves performance and
 * prevents exhausting MongoDB connection limits.
 *
 * @param {string} mongoUri - MongoDB connection string
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 * @throws {Error} If MONGO_URI is not provided or connection fails
 */
export async function connectDb(mongoUri) {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // Validate MongoDB URI
  if (!mongoUri) {
    const error = new Error('MONGO_URI not set in environment variables');
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Throw instead of process.exit for serverless
  }

  try {
    console.log('🔄 Connecting to MongoDB...');

    // Configure mongoose
    mongoose.set('strictQuery', true);

    // Connect with proper options
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    // Cache the connection
    cachedConnection = mongoose.connection;

    // Connection event listeners for better logging
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      cachedConnection = null; // Clear cache on disconnect
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    console.log('✅ MongoDB connected successfully');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Error details:', {
      name: err.name,
      code: err.code,
      codeName: err.codeName
    });

    // Clear cached connection on error
    cachedConnection = null;

    // Throw error instead of process.exit for serverless compatibility
    throw err;
  }
}




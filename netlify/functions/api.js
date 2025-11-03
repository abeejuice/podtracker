/**
 * Netlify Serverless Function for POD Tracker API
 *
 * This function wraps the Express application for deployment on Netlify.
 * It handles all API requests routed through /.netlify/functions/api/*
 *
 * Key features:
 * - Caches the Express handler between invocations (warm starts)
 * - Reuses MongoDB connections across requests in the same container
 * - Provides detailed logging for debugging
 * - Handles errors gracefully
 */

import serverless from 'serverless-http';
import { buildApp } from '../../backend/app.js';

// Cache the serverless handler between invocations
let cachedHandler = null;

/**
 * Netlify Function handler
 *
 * @param {Object} event - Netlify function event object
 * @param {Object} context - Netlify function context
 * @returns {Promise<Object>} Response object
 */
export const handler = async (event, context) => {
  // Configure context for optimal Lambda behavior
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Build handler on first invocation (cold start)
    if (!cachedHandler) {
      console.log('🥶 Cold start - Building Express app...');
      const startTime = Date.now();

      // Build Express app with production configuration
      const app = await buildApp({
        mongoUri: process.env.MONGO_URI,
        frontendUrl: process.env.FRONTEND_URL || process.env.URL
      });

      // Wrap Express app in serverless handler
      cachedHandler = serverless(app, {
        binary: ['image/*', 'application/pdf'], // Handle binary responses if needed
      });

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
        path: event.path,
        headers: event.headers
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

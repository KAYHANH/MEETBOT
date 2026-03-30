import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async (retryCount = 5) => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetbot';
  
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(uri, options);
    logger.info('✅ MongoDB Connected successfully');
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (retryCount > 0) {
      logger.info(`Retrying connection in 3 seconds... (${retryCount} attempts left)`);
      setTimeout(() => connectDB(retryCount - 1), 3000);
    } else {
      logger.error('Could not connect to MongoDB. Exiting...');
      // In this environment, we might not want to exit if mongo is not available yet
      // but the app should still start to show "Please wait..."
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

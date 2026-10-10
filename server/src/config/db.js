import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase(uri = env.MONGODB_URI) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    autoIndex: env.NODE_ENV !== 'production',
  });
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}

export function getDatabaseState() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'];
  return states[mongoose.connection.readyState] || 'unknown';
}

export default connectDatabase;

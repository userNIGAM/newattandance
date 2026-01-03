import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

console.log('[dotenv] Environment variables loaded');
console.log('SMTP_USER configured:', process.env.SMTP_USER ? 'Yes' : 'No');
import express, { json, urlencoded } from 'express';
import cors from 'cors';
// import { connection } from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/connectDB.js';

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    dbStatus: connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './db.js';

const app = express();
const PORT = process.env.PORT || 5003;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Simple test route
app.get('/api/simple', (req, res) => {
  console.log('SIMPLE ROUTE HIT');
  res.json({ message: 'Simple route works' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/simple`);
});
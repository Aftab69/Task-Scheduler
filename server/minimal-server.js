import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5003;

// Global request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Middleware
app.use(express.json());

// Simple test route
app.get('/api/simple', (req, res) => {
  console.log('SIMPLE ROUTE HIT');
  res.json({ message: 'Simple route works' });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('HEALTH ROUTE HIT');
  res.json({ status: 'OK', message: 'Task Scheduler API is running' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 for:', req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/simple`);
});
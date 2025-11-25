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

// Test PUT route
app.put('/api/test', (req, res) => {
  console.log('TEST PUT ROUTE HIT');
  res.json({ message: 'Test PUT route works' });
});

// Mock PUT /api/tasks/:id route (no auth, no database)
app.put('/api/tasks/:id', (req, res) => {
  console.log('MOCK TASK UPDATE ROUTE HIT');
  const { id } = req.params;
  const { text, date } = req.body;

  console.log('MOCK UPDATE REQUEST:', { id, text, date });

  res.json({
    id,
    text: text || 'Updated task',
    date: date || '',
    completed: false,
    message: 'Task updated successfully (mock)'
  });
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
  console.log(`Simplified server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/simple`);
});
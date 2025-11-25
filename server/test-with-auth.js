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

// Mock authentication middleware (no actual auth)
const authenticate = (req, res, next) => {
  console.log('AUTH MIDDLEWARE CALLED');
  req.user = { _id: 'mock_user_id' };
  next();
};

// Simple test route
app.get('/api/simple', (req, res) => {
  console.log('SIMPLE ROUTE HIT');
  res.json({ message: 'Simple route works' });
});

// PUT /api/tasks/:id route with mock auth
app.put('/api/tasks/:id', authenticate, (req, res) => {
  console.log('TASK UPDATE ROUTE HIT');
  const { id } = req.params;
  const { text, date } = req.body;

  console.log('UPDATE REQUEST:', { id, text, date, user: req.user._id });

  res.json({
    id,
    text: text || 'Updated task',
    date: date || '',
    completed: false,
    user: req.user._id,
    message: 'Task updated successfully (with mock auth)'
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
  console.log(`Server with auth running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/simple`);
});
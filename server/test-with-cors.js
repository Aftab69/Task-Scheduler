import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5003;

// CORS Configuration for development and production
const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = [
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:3000',
  'http://localhost:5173', // Common Vite dev port
  'https://task-scheduler-frontend.onrender.com',
  'https://task-scheduler-frontend-fzgx.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // More flexible CORS for development
  if (isDevelopment) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  } else {
    // Production CORS with allowed origins
    if (allowedOrigins.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
      res.header('Access-Control-Allow-Credentials', 'true');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    } else {
      // Reject unauthorized origins in production
      res.status(403).json({ message: 'CORS policy violation' });
    }
  }
});

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
    message: 'Task updated successfully (with CORS and mock auth)'
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
  console.log(`Server with CORS running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/simple`);
});
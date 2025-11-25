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

app.use(express.json());

// Simple test route
app.get('/api/simple', (req, res) => {
  console.log('SIMPLE ROUTE HIT');
  res.json({ message: 'Simple route works' });
});

// Test route
app.put('/api/test', (req, res) => {
  console.log('TEST ROUTE HIT');
  res.json({ message: 'Test route works' });
});

// Mock authentication routes
app.post('/api/auth/login', (req, res) => {
  console.log('MOCK LOGIN ROUTE HIT');
  const { email, password } = req.body;

  // Mock login - accept any credentials
  res.json({
    message: 'Login successful',
    user: { _id: 'mock_user_id', email, firstName: 'Test', lastName: 'User' },
    token: 'mock_jwt_token'
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('MOCK REGISTER ROUTE HIT');
  const { email, password, firstName, lastName } = req.body;

  // Mock registration
  res.json({
    message: 'User registered successfully',
    user: { _id: 'mock_user_id', email, firstName, lastName },
    token: 'mock_jwt_token'
  });
});

app.get('/api/auth/profile', (req, res) => {
  console.log('MOCK PROFILE ROUTE HIT');
  res.json({
    user: { _id: 'mock_user_id', email: 'test@example.com', firstName: 'Test', lastName: 'User' }
  });
});

// Mock task routes
app.get('/api/tasks', (req, res) => {
  console.log('MOCK GET TASKS ROUTE HIT');
  res.json([
    {
      id: 'task_test_123',
      text: 'Sample task for testing',
      date: '2025-11-25',
      completed: false,
      createdAt: Date.now()
    }
  ]);
});

app.post('/api/tasks', (req, res) => {
  console.log('MOCK CREATE TASK ROUTE HIT');
  const { text, date } = req.body;

  const newTask = {
    id: `task_${Date.now()}`,
    text,
    date: date || '',
    completed: false,
    createdAt: Date.now()
  };

  res.status(201).json(newTask);
});

// PUT /api/tasks/:id route (no auth, no database for now)
app.put('/api/tasks/:id', (req, res) => {
  console.log('TASK UPDATE ROUTE HIT');
  const { id } = req.params;
  const { text, date } = req.body;

  console.log('UPDATE REQUEST:', { id, text, date });

  res.json({
    id,
    text: text || 'Updated task',
    date: date || '',
    completed: false,
    message: 'Task updated successfully (fixed server)'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('HEALTH ROUTE HIT');
  res.json({ status: 'OK', message: 'Task Scheduler API is running' });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Scheduler API is running' });
});

// 404 handler - should be after all routes
app.use((req, res) => {
  console.log('404 for:', req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fixed server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
  console.log(`Network access: http://192.168.0.104:${PORT}/api`);
});
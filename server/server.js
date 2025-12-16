import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './db.js';
import Task from './models/Task.js';
import User from './models/User.js';
import { authenticate, generateToken } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5003;

// Global request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Connect to MongoDB
connectDB();

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

// Helper function to sort tasks
const sortTasks = (tasks) => {
  return tasks.sort((a, b) => {
    // First sort by date
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // Then sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Finally sort by creation time
    return a.createdAt - b.createdAt;
  });
};

// API Routes

// Authentication Routes

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toProfileJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toProfileJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile (protected route)
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Get all tasks (protected route)
app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ date: 1, createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get filtered tasks (protected route)
app.get('/api/tasks/filter/:filter', authenticate, async (req, res) => {
  try {
    const { filter } = req.params;
    let query = { user: req.user._id };

    if (filter === 'active') {
      query.completed = false;
    } else if (filter === 'completed') {
      query.completed = true;
    }

    const tasks = await Task.find(query).sort({ date: 1, createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error filtering tasks:', error);
    res.status(500).json({ message: 'Error filtering tasks' });
  }
});

// Create a new task (protected route)
app.post('/api/tasks', authenticate, async (req, res) => {
  try {
    const { text, date } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' });
    }

    // Date is optional for reminder tasks
    const taskDate = date || '';

    const newTask = new Task({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      date: taskDate,
      completed: false,
      createdAt: Date.now(),
      user: req.user._id
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

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

// Update a task (protected route)
console.log('REGISTERING UPDATE TASK ROUTE');
app.put('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, date } = req.body;

    console.log('UPDATE TASK REQUEST:', { id, text, date });

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' });
    }

    const task = await Task.findOne({ id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    task.text = text.trim();
    task.date = date || '';

    const updatedTask = await task.save();

    console.log(`Task updated successfully: ${id}`);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Toggle task completion (protected route)
app.put('/api/tasks/:id/toggle', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ message: 'Error toggling task' });
  }
});

// Delete a task (protected route)
app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Shift tasks by specified days (protected route)
app.put('/api/tasks/shift', authenticate, async (req, res) => {
  try {
    console.log('=== SHIFT ENDPOINT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);

    const { days } = req.body;

    if (days === undefined || days === null) {
      console.log('Error: Days is undefined or null');
      return res.status(400).json({ message: 'Number of days is required' });
    }

    const shiftDays = parseInt(days);
    if (isNaN(shiftDays)) {
      console.log('Error: Days is not a valid number:', days);
      return res.status(400).json({ message: 'Days must be a valid number' });
    }

    console.log('Shift days validated:', shiftDays);

    // Find all active (non-completed) tasks for this user
    const activeTasks = await Task.find({ completed: false, user: req.user._id });
    console.log('Found active tasks:', activeTasks.length);

    if (activeTasks.length === 0) {
      console.log('No active tasks found');
      return res.json({ message: 'No active tasks found to shift', updatedTasks: [] });
    }

    const updatedTasks = [];

    // Shift each task by the specified number of days
    for (const i = 0; i < activeTasks.length; i++) {
      const task = activeTasks[i];
      console.log(`[${i+1}/${activeTasks.length}] Processing task: ID=${task.id}, text="${task.text}", date="${task.date}", _id=${task._id}`);

      // Only shift tasks that have valid dates (skip reminder tasks with empty dates)
      if (task.date && task.date.trim() !== '') {
        try {
          console.log(`[${i+1}] Task has valid date, proceeding with shift...`);

          const [year, month, day] = task.date.split('-').map(Number);
          const currentDate = new Date(year, month - 1, day);

          // Add shift days and convert back to YYYY-MM-DD format
          currentDate.setDate(currentDate.getDate() + shiftDays);

          const newYear = currentDate.getFullYear();
          const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
          const newDay = String(currentDate.getDate()).padStart(2, '0');
          const newDateString = `${newYear}-${newMonth}-${newDay}`;

          console.log(`[${i+1}] Task ${task.id}: shifting from ${task.date} to ${newDateString}`);

          // Use native MongoDB updateOne to bypass all Mongoose validation
          console.log(`[${i+1}] Attempting MongoDB updateOne...`);
          const updateResult = await Task.updateOne(
            { _id: task._id, user: req.user._id },
            { $set: { date: newDateString } }
          );

          console.log(`[${i+1}] Update result:`, updateResult);

          if (updateResult.modifiedCount === 0) {
            console.log(`[${i+1}] Warning: No documents modified, but continuing...`);
          }

          // Fetch the updated task to return it
          console.log(`[${i+1}] Fetching updated task...`);
          const savedTask = await Task.findById(task._id);

          if (!savedTask) {
            console.log(`[${i+1}] Error: Could not find task after update`);
            throw new Error(`Failed to update task ${task.id}`);
          }

          updatedTasks.push(savedTask);
          console.log(`[${i+1}] Task ${task.id}: successfully saved with new date ${savedTask.date}`);
        } catch (saveError) {
          console.error(`[${i+1}] Error processing task ${task.id}:`, saveError);
          console.error(`[${i+1}] Error stack:`, saveError.stack);
          throw saveError;
        }
      } else {
        console.log(`[${i+1}] Task ${task.id}: skipping (no date)`);
      }
    }

    console.log(`Successfully shifted ${updatedTasks.length} tasks by ${shiftDays} days`);

    res.json({
      message: `Successfully shifted ${updatedTasks.length} tasks by ${shiftDays} days`,
      updatedTasks
    });
  } catch (error) {
    console.error('Error shifting tasks:', error);
    res.status(500).json({ message: 'Error shifting tasks' });
  }
});

// Health check endpoint for Render monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Scheduler API is running' });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Scheduler API is running' });
});

// 404 handler - should be after all routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
  console.log(`Network access: http://192.168.0.104:${PORT}/api`);
});
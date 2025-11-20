import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './db.js';
import Task from './models/Task.js';
import User from './models/User.js';
import { authenticate, generateToken } from './middleware/auth.js';

const app = express();
const PORT = 5003;

// Connect to MongoDB
connectDB();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
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

    if (!date) {
      return res.status(400).json({ message: 'Task date is required' });
    }

    const newTask = new Task({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      date,
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
    const { days } = req.body;

    if (days === undefined || days === null) {
      return res.status(400).json({ message: 'Number of days is required' });
    }

    const shiftDays = parseInt(days);
    if (isNaN(shiftDays)) {
      return res.status(400).json({ message: 'Days must be a valid number' });
    }

    // Find all active (non-completed) tasks for this user
    const activeTasks = await Task.find({ completed: false, user: req.user._id });

    if (activeTasks.length === 0) {
      return res.json({ message: 'No active tasks found to shift', updatedTasks: [] });
    }

    const updatedTasks = [];

    // Shift each task by the specified number of days
    for (const task of activeTasks) {
      const currentDate = new Date(task.date);
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + shiftDays);

      // Convert new date back to YYYY-MM-DD format
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      const newDateString = `${year}-${month}-${day}`;

      task.date = newDateString;
      await task.save();
      updatedTasks.push(task);
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Scheduler API is running' });
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
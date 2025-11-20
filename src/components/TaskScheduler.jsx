import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { tasksAPI } from '../api/tasks';

function TaskScheduler() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks from MongoDB Atlas on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Load tasks from MongoDB Atlas
  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log('Loading tasks from MongoDB Atlas...');
      const tasksData = await tasksAPI.getAll();
      console.log('Tasks loaded from MongoDB Atlas:', tasksData);
      setTasks(tasksData);
      setError(null);
    } catch (error) {
      console.error('Failed to load tasks from MongoDB Atlas:', error);
      setError('Failed to load tasks from database. Please check your connection.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new task to MongoDB Atlas
  const addTask = async (text, date) => {
    try {
      console.log('Adding task to MongoDB Atlas:', { text: text.trim(), date });
      const savedTask = await tasksAPI.create({ text: text.trim(), date });
      console.log('Task added successfully:', savedTask);
      setTasks([...tasks, savedTask]);
    } catch (error) {
      console.error('Failed to add task to MongoDB Atlas:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  // Toggle task completion in MongoDB Atlas
  const toggleTask = async (id) => {
    try {
      console.log('Toggling task completion:', id);
      const updatedTask = await tasksAPI.toggle(id);
      console.log('Task toggled successfully:', updatedTask);
      setTasks(tasks.map(task =>
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to toggle task in MongoDB Atlas:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  // Delete task from MongoDB Atlas
  const deleteTask = async (id) => {
    try {
      console.log('Deleting task:', id);
      await tasksAPI.delete(id);
      console.log('Task deleted successfully');
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task from MongoDB Atlas:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  // Get filtered tasks
  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  // Group tasks by date
  const getTasksByDate = () => {
    const filteredTasks = getFilteredTasks();
    const grouped = {};

    filteredTasks.forEach(task => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });

    // Sort tasks within each date (incomplete first, then by creation time)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.createdAt - b.createdAt;
      });
    });

    return grouped;
  };

  const groupedTasks = getTasksByDate();
  const sortedDates = Object.keys(groupedTasks).sort();

  // Show loading state
  if (loading) {
    return (
      <div className="task-scheduler">
        <h1>Task Scheduler</h1>
        <div className="loading-state">
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-scheduler">
      <h1>Task Scheduler</h1>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadTasks} className="retry-button">Retry</button>
        </div>
      )}

      <TaskForm onAddTask={addTask} />

      <div className="task-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active ({tasks.filter(t => !t.completed).length})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      <TaskList
        groupedTasks={groupedTasks}
        sortedDates={sortedDates}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}

export default TaskScheduler;
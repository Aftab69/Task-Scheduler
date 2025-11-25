import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import CalendarWidget from './CalendarWidget';
import ReminderTasks from './ReminderTasks';
import TaskEditModal from './TaskEditModal';
import { tasksAPI } from '../api/tasks';
import { useAuth } from '../context/AuthContext';

function TaskScheduler() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [shiftStatus, setShiftStatus] = useState(null); // null, 'success', or 'error'
  const [shiftMessage, setShiftMessage] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const tasksPerPage = 10; // Show 10 tasks per page
  const { user, logout } = useAuth();

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

  // Update task from MongoDB Atlas
  const updateTask = async (taskData) => {
    try {
      console.log('Updating task:', taskData.id);
      const updatedTask = await tasksAPI.update(taskData.id, {
        text: taskData.text,
        date: taskData.date
      });
      console.log('Task updated successfully:', updatedTask);

      // Update tasks state with the updated task
      setTasks(tasks.map(task =>
        task.id === taskData.id ? updatedTask : task
      ));

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task from MongoDB Atlas:', error);
      setError('Failed to update task. Please try again.');
      throw error;
    }
  };

  // Shift tasks by specified days
  const shiftTasks = async (days) => {
    try {
      console.log(`Shifting all active tasks by ${days} days`);
      const data = await tasksAPI.shift(days);
      console.log('Tasks shifted successfully:', data);

      // Update tasks state with the shifted data instead of reloading
      const updatedTasks = data.updatedTasks || data.tasks || data || [];
      setTasks(Array.isArray(updatedTasks) ? updatedTasks : []);

      // Set success message
      setShiftStatus('success');
      setShiftMessage(`Successfully shifted all active tasks by ${days} day(s)`);

      // Clear status message after 5 seconds
      setTimeout(() => {
        setShiftStatus(null);
        setShiftMessage('');
      }, 5000);

      return data;
    } catch (error) {
      console.error('Failed to shift tasks:', error);
      setShiftStatus('error');
      setShiftMessage('Failed to shift tasks. Please try again.');

      // Clear error message after 5 seconds
      setTimeout(() => {
        setShiftStatus(null);
        setShiftMessage('');
      }, 5000);

      throw error;
    }
  };

  const openEditModal = (taskOrId) => {
    const task = typeof taskOrId === 'object' ? taskOrId : tasks.find(t => t.id === taskOrId);
    if (task) {
      setEditingTask(task);
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setEditingTask(null);
    setIsEditModalOpen(false);
  };

  const handleTaskUpdate = async (taskData) => {
    try {
      const updatedTask = await tasksAPI.update(taskData.id, {
        text: taskData.text,
        date: taskData.date
      });

      // Update tasks state with the updated task
      setTasks(tasks.map(task =>
        task.id === taskData.id ? updatedTask : task
      ));

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  // Reset current page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Get paginated tasks
  const getPaginatedTasks = () => {
    const filteredTasks = getFilteredTasks();
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = () => {
    const filteredTasks = getFilteredTasks();
    return Math.ceil(filteredTasks.length / tasksPerPage);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get tasks for current page (for display)
  const getCurrentPageTasks = () => {
    const paginatedTasks = getPaginatedTasks();
    const grouped = {};

    paginatedTasks.forEach(task => {
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

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Optionally, you could filter tasks to show only selected date
    // Or navigate to that date in the task list
  };

  // Get filtered tasks (exclude reminder tasks - tasks without dates)
  const getFilteredTasks = () => {
    const datedTasks = tasks.filter(task => task.date && task.date.trim() !== '');

    switch (filter) {
      case 'active':
        return datedTasks.filter(task => !task.completed);
      case 'completed':
        return datedTasks.filter(task => task.completed);
      default:
        return datedTasks;
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

  const groupedTasks = getCurrentPageTasks();
  const sortedDates = Object.keys(groupedTasks).sort();
  const totalPages = getTotalPages();
  const totalTasks = getFilteredTasks().length;

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
      <div className="white-container">
        <div className="header-section">
          <h1>Task Scheduler</h1>
          <div className="user-info">
            <span className="welcome-message">
              Welcome, {user?.firstName || user?.username}!
            </span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadTasks} className="retry-button">Retry</button>
          </div>
        )}

        <div className="app-content">
          {/* Main layout: Calendar left, Tasks right */}
          <div className="main-layout">
            {/* Left: Calendar Section */}
            <div className="calendar-section">
              <CalendarWidget
                tasks={getFilteredTasks()}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onShiftTasks={shiftTasks}
                shiftStatus={shiftStatus}
                shiftMessage={shiftMessage}
              />

              {/* Reminder Tasks Widget - moved to left side below calendar */}
              <ReminderTasks
                tasks={tasks}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onEditTask={openEditModal}
              />
            </div>

            {/* Right: Tasks Section */}
            <div className="tasks-section">
              <TaskForm onAddTask={addTask} selectedDate={selectedDate} />

              <div className="task-filters">
                <button
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => setFilter('all')}
                >
                  All ({getFilteredTasks().length})
                </button>
                <button
                  className={filter === 'active' ? 'active' : ''}
                  onClick={() => setFilter('active')}
                >
                  Active ({getFilteredTasks().filter(t => !t.completed).length})
                </button>
                <button
                  className={filter === 'completed' ? 'active' : ''}
                  onClick={() => setFilter('completed')}
                >
                  Completed ({getFilteredTasks().filter(t => t.completed).length})
                </button>
              </div>

              <TaskList
                groupedTasks={groupedTasks}
                sortedDates={sortedDates}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onEditTask={openEditModal}
              />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    <span>Showing {((currentPage - 1) * tasksPerPage) + 1}-{Math.min(currentPage * tasksPerPage, totalTasks)} of {totalTasks} tasks</span>
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}

export default TaskScheduler;
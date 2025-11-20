import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import CalendarWidget from './CalendarWidget';
import { tasksAPI } from '../api/tasks';

function TaskScheduler() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10; // Show 10 tasks per page

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

  // Shift tasks by specified days
  const shiftTasks = async (days) => {
    try {
      console.log(`Shifting all active tasks by ${days} days`);
      const response = await fetch('http://localhost:5003/api/tasks/shift', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to shift tasks');
      }

      const data = await response.json();
      console.log('Tasks shifted successfully:', data);

      // Reload tasks to get the updated data
      await loadTasks();

      return data;
    } catch (error) {
      console.error('Failed to shift tasks:', error);
      setError('Failed to shift tasks. Please try again.');
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
        <h1>Task Scheduler</h1>

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
              />
            </div>

            {/* Right: Tasks Section */}
            <div className="tasks-section">
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
    </div>
  );
}

export default TaskScheduler;
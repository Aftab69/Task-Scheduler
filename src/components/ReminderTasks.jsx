import { useState, useEffect } from 'react';

function ReminderTasks({ tasks, onAddTask, onToggleTask, onDeleteTask, onEditTask }) {
  const [newTaskText, setNewTaskText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination settings
  const tasksPerPage = 5;

  // Filter tasks that don't have a date (reminder tasks)
  const reminderTasks = tasks.filter(task => !task.date || task.date === '');

  // Get current tasks for this page
  const getCurrentPageTasks = () => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return reminderTasks.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = () => {
    return Math.ceil(reminderTasks.length / tasksPerPage);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when tasks change
  useEffect(() => {
    setCurrentPage(1);
  }, [reminderTasks.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTaskText.trim()) return;

    try {
      await onAddTask(newTaskText.trim(), ''); // Empty date for reminder tasks
      setNewTaskText('');
    } catch (error) {
      console.error('Error adding reminder task:', error);
      alert('Failed to add reminder task. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setNewTaskText(e.target.value);
  };

  return (
    <div className="reminder-tasks-container">
      <div className="reminder-tasks-content">
        <h3>Reminder Tasks</h3>
        <p className="reminder-description">
          Tasks without specific dates. Add miscellaneous tasks here.
        </p>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="reminder-input-group">
            <input
              type="text"
              value={newTaskText}
              onChange={handleInputChange}
              placeholder="Add a reminder task..."
              className="reminder-input"
              maxLength={200}
            />
            <button
              type="submit"
              className="add-reminder-button"
              disabled={!newTaskText.trim()}
            >
              Add
            </button>
          </div>
        </form>

        {reminderTasks.length > 0 ? (
          <>
            <div className="reminder-tasks-list">
              {getCurrentPageTasks().map(task => (
                <div key={task.id} className={`reminder-task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="reminder-task-content">
                    <div className="reminder-task-text">
                      {task.text}
                    </div>
                    <div className="reminder-task-actions">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`toggle-reminder-button ${task.completed ? 'completed' : ''}`}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="edit-reminder-button"
                        title="Edit reminder task"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="delete-reminder-button"
                        title="Delete reminder task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {getTotalPages() > 1 && (
              <div className="reminder-pagination-container">
                <div className="reminder-pagination-info">
                  <span>
                    Showing {((currentPage - 1) * tasksPerPage) + 1}-{Math.min(currentPage * tasksPerPage, reminderTasks.length)} of {reminderTasks.length} reminder tasks
                  </span>
                </div>
                <div className="reminder-pagination-controls">
                  <button
                    className="reminder-pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="reminder-page-info">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                  <button
                    className="reminder-pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === getTotalPages()}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-reminder-tasks">
            <p>No reminder tasks yet. Add some miscellaneous tasks above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReminderTasks;
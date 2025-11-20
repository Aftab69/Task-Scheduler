import { useState, useEffect } from 'react';

const TaskDetailViewer = ({ selectedDate, tasks, onClose, onToggleTask, onDeleteTask }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Format date for display
  const formatDateString = (date) => {
    if (!date) return '';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  };

  // Get tasks for the selected date
  const getTasksForDate = () => {
    if (!selectedDate) return [];
    const dateString = selectedDate.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateString);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  // Show/hide animation
  useEffect(() => {
    if (selectedDate) {
      setIsVisible(true);
      document.body.classList.add('has-popup-open');
    } else {
      setIsVisible(false);
      document.body.classList.remove('has-popup-open');
    }
  }, [selectedDate]);

  // Clean up body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('has-popup-open');
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const dateTasks = getTasksForDate();
  const activeTasks = dateTasks.filter(task => !task.completed);
  const completedTasks = dateTasks.filter(task => task.completed);

  if (!selectedDate) return null;

  return (
    <div className={`task-detail-viewer ${isVisible ? 'visible' : ''}`} onClick={handleBackdropClick}>
      <div className={`task-detail-modal ${isVisible ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="task-detail-header">
          <div className="task-detail-date">
            <h2>{formatDateString(selectedDate)}</h2>
            <div className="task-detail-stats">
              <span className="stat-badge active">
                {activeTasks.length} Active
              </span>
              <span className="stat-badge completed">
                {completedTasks.length} Completed
              </span>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="task-detail-content">
          {dateTasks.length === 0 ? (
            <div className="no-tasks-message">
              <div className="no-tasks-icon">📋</div>
              <h3>No tasks scheduled</h3>
              <p>There are no tasks for {formatDateString(selectedDate).toLowerCase()}</p>
            </div>
          ) : (
            <div className="tasks-list">
              {activeTasks.length > 0 && (
                <div className="task-section">
                  <h3 className="section-title">Active Tasks ({activeTasks.length})</h3>
                  {activeTasks.map(task => (
                    <TaskDetailItem
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              )}

              {completedTasks.length > 0 && (
                <div className="task-section">
                  <h3 className="section-title">Completed Tasks ({completedTasks.length})</h3>
                  {completedTasks.map(task => (
                    <TaskDetailItem
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="task-detail-footer">
          <div className="task-summary">
            Total: {dateTasks.length} tasks •
            {dateTasks.length > 0 && ` ${Math.round((completedTasks.length / dateTasks.length) * 100)}% complete`}
          </div>
          <button className="add-task-button" onClick={() => {
            // Focus on the task form when closed
            handleClose();
            setTimeout(() => {
              const taskInput = document.querySelector('.task-input');
              if (taskInput) {
                taskInput.focus();
                // Set the date to the selected date
                const dateInput = document.querySelector('.date-input');
                if (dateInput) {
                  const dateString = selectedDate.toISOString().split('T')[0];
                  dateInput.value = dateString;
                }
              }
            }, 300);
          }}>
            + Add Task for This Date
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual task item component for the detail view
const TaskDetailItem = ({ task, onToggle, onDelete, onClose }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleToggle = () => {
    if (onToggle) onToggle(task.id);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      if (onDelete) onDelete(task.id);
      setDeleteConfirm(false);
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`task-detail-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-detail-main">
        <input
          type="checkbox"
          className="task-detail-checkbox"
          checked={task.completed}
          onChange={handleToggle}
        />
        <div className="task-detail-info">
          <div className="task-detail-text">{task.text}</div>
          <div className="task-detail-time">
            Created at {formatTime(task.createdAt)}
          </div>
        </div>
      </div>
      <div className="task-detail-actions">
        <button
          className={`delete-detail-button ${deleteConfirm ? 'confirm' : ''}`}
          onClick={handleDelete}
        >
          {deleteConfirm ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default TaskDetailViewer;
import { useState, useEffect } from 'react';

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
  };

  const handleUpdate = (updatedTask) => {
    onEdit(updatedTask);
    setShowEditModal(false);
  };

  return (
    <>
      <div className={`task-item ${task.completed ? 'completed' : ''}`}>
        <div className="task-content">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            className="task-checkbox"
          />
          <span className="task-text">{task.text}</span>
        </div>

        <div className="task-actions">
          <button
            onClick={handleEdit}
            className="edit-button"
            title="Edit task"
          >
            ✏️
          </button>
          {showDeleteConfirm ? (
            <button
              onClick={handleDelete}
              className="delete-button confirm"
              title="Click again to confirm delete"
            >
              Confirm?
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="delete-button"
              title="Delete task"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <TaskEditModal
        task={task}
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        onUpdate={handleUpdate}
      />
    </>
  );
}

function TaskEditModal({ task, isOpen, onClose, onUpdate }) {
  const [editedText, setEditedText] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setEditedText(task.text || '');
      setEditedDate(task.date || '');
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // Also target HTML element for better compatibility
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.top = `-${window.scrollY}px`;
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';

      // Add class to body for CSS-based prevention
      document.body.classList.add('modal-open');

      // Store scroll position as CSS variable for modal positioning compensation
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty('--scroll-position', `${scrollY}px`);
    } else {
      // Restore body scroll when modal is closed
      const scrollY = document.body.style.top;

      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';

      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.top = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';

      // Remove class from body
      document.body.classList.remove('modal-open');

      // Restore scroll position
      if (scrollY) {
        const scrollPosition = Math.abs(parseInt(scrollY || '0', 10));
        window.scrollTo(0, scrollPosition);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';

      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.top = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';

      document.body.classList.remove('modal-open');

      // Remove CSS variable
      document.documentElement.style.removeProperty('--scroll-position');
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (!editedText.trim()) {
      setError('Task text cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Import tasksAPI dynamically to avoid circular dependency
      const { tasksAPI } = await import('../api/tasks');
      const updatedTask = await tasksAPI.update(task.id, {
        text: editedText.trim(),
        date: editedDate || null
      });

      // Call onEdit with the updated task
      onEdit(updatedTask);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'visible' : ''}`} onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button
            className="close-button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="task-text">Task Text</label>
            <textarea
              id="task-text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Enter your task description..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-date">Due Date (optional)</label>
            <input
              id="task-date"
              type="date"
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
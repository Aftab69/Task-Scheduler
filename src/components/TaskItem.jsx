import { useState } from 'react';

function TaskItem({ task, onToggle, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  return (
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
  );
}

export default TaskItem;
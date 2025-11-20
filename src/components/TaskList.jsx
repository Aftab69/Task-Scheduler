import TaskItem from './TaskItem';

function TaskList({ groupedTasks, sortedDates, onToggleTask, onDeleteTask }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(dateString + 'T00:00:00');

    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (taskDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTaskCountText = (tasks) => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return `${completed} of ${total} completed`;
  };

  if (sortedDates.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. Add your first task above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {sortedDates.map(date => {
        const tasks = groupedTasks[date];
        return (
          <div key={date} className="date-group">
            <div className="date-header">
              <h3>{formatDate(date)}</h3>
              <span className="task-count">{getTaskCountText(tasks)}</span>
            </div>
            <div className="tasks-for-date">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;
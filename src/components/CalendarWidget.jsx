import { useState, useEffect } from 'react';
import TaskDetailViewer from './TaskDetailViewer';
import TaskShifter from './TaskShifter';

const CalendarWidget = ({ tasks, onDateSelect, selectedDate, onToggleTask, onDeleteTask, onShiftTasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [detailViewDate, setDetailViewDate] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper function to get tasks for a specific date
  const getTasksForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return tasks.filter(task => task.date === dateString);
  };

  // Helper function to check if a date has tasks
  const hasTasks = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return tasks.some(task => task.date === dateString);
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Previous month days to show
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Next month days to show
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    setCalendarDays(days);
  };

  // Navigation functions
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Format date for display
  const formatDateString = (date) => {
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
      return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
    // Open detail view for the selected date
    setDetailViewDate(date);
  };

  // Handle close of detail view
  const handleDetailViewClose = () => {
    setDetailViewDate(null);
  };

  // Generate calendar days when month changes
  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, tasks]);

  return (
    <>
      <div className="calendar-widget">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="nav-btn" onClick={previousMonth}>
              ←
            </button>
            <h3 className="calendar-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button className="nav-btn" onClick={nextMonth}>
              →
            </button>
          </div>
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
        </div>

        <div className="calendar-grid">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const dateTasks = getTasksForDate(date);
            const hasActiveTasks = dateTasks.some(task => !task.completed);
            const hasCompletedTasks = dateTasks.some(task => task.completed);
            const isCurrentMonthDay = isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`calendar-day ${
                  isCurrentMonthDay ? 'current-month' : 'other-month'
                } ${isToday(date) ? 'today' : ''} ${
                  isSelected(date) ? 'selected' : ''
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className="calendar-date-number">
                  {date.getDate()}
                </div>

                {/* Task indicators */}
                {dateTasks.length > 0 && (
                  <div className="task-indicators">
                    {hasActiveTasks && (
                      <div className="task-indicator active" title={`${dateTasks.filter(t => !t.completed).length} active tasks`} />
                    )}
                    {hasCompletedTasks && (
                      <div className="task-indicator completed" title={`${dateTasks.filter(t => t.completed).length} completed tasks`} />
                    )}
                  </div>
                )}

                </div>
            );
          })}
        </div>

        {/* Selected date info */}
        {selectedDate && (
          <div className="selected-date-info">
            <h4>{formatDateString(selectedDate)}</h4>
            {getTasksForDate(selectedDate).length > 0 ? (
              <div className="selected-date-tasks">
                <div className="task-summary">
                  {getTasksForDate(selectedDate).filter(t => !t.completed).length} active,{' '}
                  {getTasksForDate(selectedDate).filter(t => t.completed).length} completed
                </div>
              </div>
            ) : (
              <div className="no-tasks">No tasks scheduled</div>
            )}
          </div>
        )}
      </div>

      {/* Task Shifter Component */}
      <TaskShifter onShiftTasks={onShiftTasks} />

      {/* Task Detail Viewer Modal */}
      <TaskDetailViewer
        selectedDate={detailViewDate}
        tasks={tasks}
        onClose={handleDetailViewClose}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
      />
    </>
  );
};

export default CalendarWidget;
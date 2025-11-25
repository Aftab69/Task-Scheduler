import { useState } from 'react';

function TaskShifter({ onShiftTasks, shiftStatus, shiftMessage }) {
  const [shiftDays, setShiftDays] = useState('');
  const [isShifting, setIsShifting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const days = parseInt(shiftDays);
    if (isNaN(days) || days === 0) {
      // Note: Parent component handles error state
      return;
    }

    setIsShifting(true);

    try {
      await onShiftTasks(days);
      setShiftDays(''); // Clear input after successful shift
      // Note: Parent component handles success state
    } catch (error) {
      console.error('Error shifting tasks:', error);
      // Note: Parent component handles error state
    } finally {
      setIsShifting(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === '' || /^[+-]?\d*$/.test(value)) {
      setShiftDays(value);
    }
  };

  return (
    <div className="task-shifter-container">
      <div className="task-shifter-content">
        <h3>Shift Tasks</h3>
        <form onSubmit={handleSubmit} className="task-shifter-form">
          <div className="shift-input-group">
            <label htmlFor="shiftDays">Shift all active tasks by:</label>
            <div className="shift-input-container">
              <input
                id="shiftDays"
                type="number"
                value={shiftDays}
                onChange={handleInputChange}
                placeholder="Enter days"
                className="shift-days-input"
                min="-365"
                max="365"
                disabled={isShifting}
              />
              <span className="shift-days-label">days</span>
            </div>
          </div>
          <button
            type="submit"
            className="shift-tasks-button"
            disabled={isShifting || !shiftDays || shiftDays === '0'}
          >
            {isShifting ? 'Shifting...' : 'Shift'}
          </button>
        </form>

        {/* Status message display */}
        {shiftMessage && (
          <div className={`shift-message ${shiftStatus}`}>
            {shiftMessage}
          </div>
        )}

        <div className="shift-info">
          <small>
            Positive numbers shift tasks forward, negative numbers shift them backward.
            Only active (uncompleted) tasks will be shifted.
          </small>
        </div>
      </div>
    </div>
  );
}

export default TaskShifter;
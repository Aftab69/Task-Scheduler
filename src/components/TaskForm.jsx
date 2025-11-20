import { useState } from 'react';

function TaskForm({ onAddTask }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState(getTodayDateString());

  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (text.trim() && date) {
      onAddTask(text.trim(), date);
      setText(''); // Clear input but keep the date
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a new task..."
          className="task-input"
          maxLength={200}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
          min={getTodayDateString()}
        />
        <button type="submit" className="add-button" disabled={!text.trim()}>
          Add Task
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
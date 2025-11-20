const API_BASE_URL = 'http://localhost:5001/api';

export const tasksAPI = {
  // Get all tasks
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get filtered tasks
  getFiltered: async (filter) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/filter/${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered tasks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered tasks:', error);
      throw error;
    }
  },

  // Create a new task
  create: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Toggle task completion
  toggle: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to toggle task');
      }
      return await response.json();
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  },

  // Delete a task
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('API health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  },
};
const getApiBaseUrl = () => {
  // Check for production environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Check if we're on Render (production)
  if (window.location.hostname.includes('onrender.com')) {
    // Use the environment variable or fallback to correct backend URL
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Fallback for Render production
    return `https://task-scheduler-backend-i109.onrender.com/api`;
  }

  // In development, detect if we're accessing from a network IP
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same host as the frontend but different port
    return `http://${window.location.hostname}:5003/api`;
  }

  // Default for localhost development - use local development server
  return 'http://localhost:5003/api';
};

export const API_BASE_URL = getApiBaseUrl();
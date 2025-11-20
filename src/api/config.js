const getApiBaseUrl = () => {
  // In development, detect if we're accessing from a network IP
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same host as the frontend but different port
    return `http://${window.location.hostname}:5001/api`;
  }
  // Default for localhost development
  return 'http://localhost:5001/api';
};

export const API_BASE_URL = getApiBaseUrl();
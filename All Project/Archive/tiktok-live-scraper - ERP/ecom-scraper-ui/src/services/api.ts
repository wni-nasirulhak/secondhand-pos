import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error or handle specific status codes
    return Promise.reject(error);
  }
);

export default api;

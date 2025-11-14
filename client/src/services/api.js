import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      const isProtectedRoute = currentPath.includes('/admin') || 
                               currentPath.includes('/profile') || 
                               currentPath.includes('/orders') ||
                               currentPath.includes('/checkout');
      
      // Only redirect if on a protected route and not already on auth page
      if (isProtectedRoute && !isAuthPage) {
        localStorage.removeItem('token');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
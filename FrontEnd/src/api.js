// api.js
// Make sure your api.js looks like this

import axios from 'axios';

const api = axios.create({
  baseURL: '/', // This should match your proxy configuration
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
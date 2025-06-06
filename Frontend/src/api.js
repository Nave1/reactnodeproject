import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5001', // Update to your backend base URL if different
  withCredentials: true,
});

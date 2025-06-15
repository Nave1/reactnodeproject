// src/api/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const login = (data) =>
  axios.post(`${API_URL}/auth/login`, data, { withCredentials: true });

export const register = (data) =>
  axios.post(`${API_URL}/auth/register`, data, { withCredentials: true });


export const forgotPassword = (email) =>
  axios.post(`${API_URL}/auth/forgot-password`, { email });

export const resetPassword = (token, password) =>
  axios.post(`${API_URL}/auth/reset-password`, { token, password });

export const verifyEmail = (token) =>
  axios.get(`${API_URL}/auth/verify-email?token=${token}`);

export const sendContactEmail = (formData) =>
  fetch(`${API_URL}/auth/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  }).then(res => res.json());

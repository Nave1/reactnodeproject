// src/pages/Login.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardsContext } from '../CardsContext';
import '../App.css';

const Login = () => {
  const { login } = useContext(CardsContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let error = '';
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === 'email' && !validateEmail(value)) {
      error = 'Invalid email address';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: !formData.email.trim()
        ? 'Email is required'
        : !validateEmail(formData.email)
        ? 'Invalid email address'
        : '',
      password: !formData.password.trim()
        ? 'Password is required'
        : ''
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(err => err)) return;

    const res = await login(formData.email, formData.password);
    if (res.success) {
      console.log('Login successful:', res);
      
      navigate('/');   // or '/home' if that’s your protected route
    } else {
      alert(res.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email:<span className="required-asterisk">*</span></label>
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'input-error' : ''}
          required
        />
        {errors.email && <span className="error-message">{errors.email}</span>}

        <label>Password:<span className="required-asterisk">*</span></label>
        <input
          type="password"
          name="password"
          placeholder="Your Password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'input-error' : ''}
          required
        />
        {errors.password && <span className="error-message">{errors.password}</span>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

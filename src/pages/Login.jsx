// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    let error = '';
    if (value.trim() === '') {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === 'email' && !validateEmail(value)) {
      error = 'Invalid email address';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      email: formData.email.trim() === '' ? 'Email is required' : !validateEmail(formData.email) ? 'Invalid email address' : '',
      password: formData.password.trim() === '' ? 'Password is required' : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err !== '')) {
      return;
    }

    axios.post('http://localhost:5001/login', {
      email: formData.email,
      password: formData.password,
    })
      .then((response) => {
        console.log('Login response:', response.data);
        if (response.data.success) {
          // Save user info in a cookie (expires in 1 day)
          Cookies.set('user', JSON.stringify(response.data.user), { expires: 1 });
          setLoggedIn(true);
          navigate('/'); // Redirect to home page
        } else {
          alert(response.data.message || 'Error logging in.');
        }
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert('Error logging in.');
        }
      });
  };

  if (loggedIn) {
    return (
      <div className="login-container">
        <h1>Login</h1>
        <p className="success-message">Logged In Successfully</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email">
          Email:<span className="required-asterisk">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}

        <label htmlFor="password">
          Password:<span className="required-asterisk">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Your Password"
          value={formData.password}
          onChange={handleChange}
          required
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

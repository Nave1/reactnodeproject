// src/pages/Register.jsx
import React, { useState } from 'react';
import '../App.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [registered, setRegistered] = useState(false);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Handle changes and perform real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = '';
    if (value.trim() === '') {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else {
      if (name === 'email' && !validateEmail(value)) {
        error = 'Invalid email address';
      }
      if (name === 'confirmPassword' && value !== formData.password) {
        error = 'Passwords do not match';
      }
      if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      firstName: formData.firstName.trim() === '' ? 'First Name is required' : '',
      lastName: formData.lastName.trim() === '' ? 'Last Name is required' : '',
      idNumber: formData.idNumber.trim() === '' ? 'ID Number is required' : '',
      email:
        formData.email.trim() === ''
          ? 'Email is required'
          : !validateEmail(formData.email)
            ? 'Invalid email address'
            : '',
      password: formData.password.trim() === '' ? 'Password is required' : '',
      confirmPassword:
        formData.confirmPassword.trim() === ''
          ? 'Confirm Password is required'
          : formData.confirmPassword !== formData.password
            ? 'Passwords do not match'
            : '',
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err !== '')) {
      return;
    }

    // Send a POST request to the Node.js server
    fetch('http://localhost:5001/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        email: formData.email,
        password: formData.password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRegistered(true);
        } else {
          alert('Error signing up.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error signing up.');
      });
  };

  if (registered) {
    return (
      <div className="register-container">
        <h1>Register</h1>
        <p className="success-message">Signed Up Successfully</p>
      </div>
    );
  }

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="firstName">
          First Name:<span className="required-asterisk">*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          placeholder="Your First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className={errors.firstName ? 'input-error' : ''}
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}

        <label htmlFor="lastName">
          Last Name:<span className="required-asterisk">*</span>
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          placeholder="Your Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          className={errors.lastName ? 'input-error' : ''}
        />
        {errors.lastName && <span className="error-message">{errors.lastName}</span>}

        <label htmlFor="idNumber">
          ID Number:<span className="required-asterisk">*</span>
        </label>
        <input
          type="text"
          id="idNumber"
          name="idNumber"
          placeholder="Your ID Number"
          value={formData.idNumber}
          onChange={handleChange}
          required
          className={errors.idNumber ? 'input-error' : ''}
        />
        {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}

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

        <label htmlFor="confirmPassword">
          Confirm Password:<span className="required-asterisk">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm Your Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={errors.confirmPassword ? 'input-error' : ''}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;

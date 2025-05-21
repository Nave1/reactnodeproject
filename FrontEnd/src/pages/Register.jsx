// Register Component
// in: 
//   - No props are passed.
//   - Uses React useState hook to manage form input values (firstName, lastName, idNumber, email, password, confirmPassword),
//     validation error messages, and registration success status.
// out:
//   - Renders a sign-up form for new users.
//   - Performs both real-time and final validation of inputs using regex patterns.
//   - Sends a POST request to the backend with the registration data.
//   - Displays a success message upon successful registration, or error alerts if registration fails.
// Additional: This component is typically used on the registration page ("/register").

import React, { useState } from 'react';
import api from '../api';     // ← use shared axios instance
import '../App.css';

const Register = () => {
  // in: Initializes state for form inputs and error messages.
  // out: formData holds the current input values; errors holds validation errors; registered indicates if sign-up was successful.
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

  // in: Defines regex patterns for validation.
  // out: nameRegex allows only letters and spaces; idRegex allows only digits;
  //      passwordRegex ensures a minimum of 8 characters including uppercase, lowercase, and a digit.
  const nameRegex = /^[A-Za-z\s]+$/;
  const idRegex = /^\d+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  // in: Validates an email string using a simple regex.
  // out: Returns true if the email is valid; false otherwise.
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // in: Handles input change events for all form fields.
  // out: Updates the corresponding field in formData and performs real-time validation,
  //      setting an appropriate error message if the input is empty or invalid.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = '';
    if (value.trim() === '') {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else {
      if ((name === 'firstName' || name === 'lastName') && !nameRegex.test(value)) {
        error = `${name === 'firstName' ? 'First Name' : 'Last Name'} must contain only letters`;
      }
      if (name === 'idNumber' && !idRegex.test(value)) {
        error = 'ID Number must contain only digits';
      }
      if (name === 'email' && !validateEmail(value)) {
        error = 'Invalid email address';
      }
      if (name === 'password' && !passwordRegex.test(value)) {
        error =
          'Password must be at least 8 characters and include uppercase, lowercase letters, and numbers';
      }
      if (name === 'confirmPassword' && value !== formData.password) {
        error = 'Passwords do not match';
      }
      // NEW: fix typo to spread previous errors correctly
      if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    }
    // NEW: fix typo here as well
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // in: Handles form submission.
  // out: Performs final validation and sends a POST to /register via our proxy.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation check
    const newErrors = {
      firstName:
        formData.firstName.trim() === ''
          ? 'First Name is required'
          : !nameRegex.test(formData.firstName)
          ? 'First Name must contain only letters'
          : '',
      lastName:
        formData.lastName.trim() === ''
          ? 'Last Name is required'
          : !nameRegex.test(formData.lastName)
          ? 'Last Name must contain only letters'
          : '',
      idNumber:
        formData.idNumber.trim() === ''
          ? 'ID Number is required'
          : !idRegex.test(formData.idNumber)
          ? 'ID Number must contain only digits'
          : '',
      email:
        formData.email.trim() === ''
          ? 'Email is required'
          : !validateEmail(formData.email)
          ? 'Invalid email address'
          : '',
      password:
        formData.password.trim() === ''
          ? 'Password is required'
          : !passwordRegex.test(formData.password)
          ? 'Password must be at least 8 characters and include uppercase, lowercase letters, and numbers'
          : '',
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

    // Debug: log the data being sent
    console.log('Submitting registration data:', formData);

    // NEW: use proxy'ed, credentialed api.post
    api
      .post('/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        email: formData.email,
        password: formData.password,
      })
      .then((response) => {
        console.log('Response:', response.data);
        if (response.data.success) {
          setRegistered(true);
        } else {
          alert(response.data.message || 'Error signing up.');
        }
      })
      .catch((error) => {
        console.error('Error signing up:', error);
        if (error.response?.data?.error?.includes('Duplicate entry')) {
          alert('User already exists.');
        } else {
          alert('Error signing up: ' + (error.response?.data?.error || error.message));
        }
      });
  };

  // in: Checks the registration status.
  // out: If the user has successfully registered, renders a success message instead of the form.
  if (registered) {
    return (
      <div className="register-container">
        <h1>Register</h1>
        <p className="success-message">Signed Up Successfully</p>
      </div>
    );
  }

  // out: Renders the registration form with input fields and validation messages.
  return (
    <div className="register-container">
      <h1>Sign Up</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        {/* First Name */}
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

        {/* Last Name */}
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

        {/* ID Number */}
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

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm Password */}
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

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Register;

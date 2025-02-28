// src/pages/Contact.jsx
import React, { useState } from 'react';
import '../App.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);

  // Validate email format
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
      name: formData.name.trim() === '' ? 'Name is required' : '',
      email:
        formData.email.trim() === ''
          ? 'Email is required'
          : !validateEmail(formData.email)
            ? 'Invalid email address'
            : '',
      message: formData.message.trim() === '' ? 'Message is required' : '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err !== '')) {
      return;
    }

    fetch('http://localhost:5001/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmailSent(true);
        } else {
          alert('There was an error sending the email.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('There was an error sending the email.');
      });
  };

  if (emailSent) {
    return (
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="success-message">Email sent successfully!</p>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>
        If you have any questions, feedback, or suggestions, feel free to reach out to us using the form below:
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">
          Name:<span className="required-asterisk">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}

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

        <label htmlFor="message">
          Message:<span className="required-asterisk">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Your Message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          className={errors.message ? 'input-error' : ''}
        ></textarea>
        {errors.message && <span className="error-message">{errors.message}</span>}

        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;

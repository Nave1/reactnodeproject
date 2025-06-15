// Contact Component
// in: No props are passed.
//     Uses React useState hook to manage form data, validation errors, and email-sent state.
// out: Renders a contact form that collects name, email, and message.
//      Validates inputs, sends the data via a POST request to a backend endpoint,
//      and shows a success message once the email is sent.
// Additional: This component displays error messages for empty or invalid inputs and uses basic regex validation for the email.
import React, { useState } from 'react';
import '../App.css';
import { sendContactEmail } from '../api/auth'; // Centralized API

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);

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

    sendContactEmail(formData)
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

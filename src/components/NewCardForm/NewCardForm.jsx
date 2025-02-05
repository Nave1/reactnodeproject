// src/components/NewCardForm/NewCardForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardsContext } from '../../CardsContext';
import "./NewCardForm.css";

const NewCardForm = () => {
  // State לשדות הטופס
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);

  // state לאחסון הודעות שגיאה לכל שדה
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    email: '',
    address: '',
    image: '',
  });

  const navigate = useNavigate();
  const { addCard } = useContext(CardsContext);

  // פונקציה לבדיקת תקינות אימייל
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // פונקציות onChange לכל שדה, שמעדכנות גם את הודעות השגיאה בזמן אמת
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    setErrors((prev) => ({
      ...prev,
      title: value.trim() === '' ? 'Title is required' : '',
    }));
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    setErrors((prev) => ({
      ...prev,
      content: value.trim() === '' ? 'Content is required' : '',
    }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    let error = '';
    if (value.trim() === '') error = 'Email is required';
    else if (!validateEmail(value)) error = 'Invalid email';
    setErrors((prev) => ({
      ...prev,
      email: error,
    }));
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setErrors((prev) => ({
      ...prev,
      address: value.trim() === '' ? 'Address is required' : '',
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setErrors((prev) => ({
      ...prev,
      image: file ? '' : 'Image is required',
    }));
  };

  // פונקציה ליצירת slug מהכותרת – המרה לאותיות קטנות והחלפת רווחים במקף
  const createSlug = (title) =>
    title.toLowerCase().trim().replace(/\s+/g, '-');

  const handleSubmit = (e) => {
    e.preventDefault();

    // בדיקה סופית לכל השדות
    const newErrors = {
      title: title.trim() === '' ? 'Title is required' : '',
      content: content.trim() === '' ? 'Content is required' : '',
      email:
        email.trim() === ''
          ? 'Email is required'
          : !validateEmail(email)
            ? 'Invalid email'
            : '',
      address: address.trim() === '' ? 'Address is required' : '',
      image: image ? '' : 'Image is required',
    };

    setErrors(newErrors);

    // אם קיימת הודעת שגיאה כלשהי, לא נמשיך בהגשה
    if (Object.values(newErrors).some((err) => err !== '')) {
      return;
    }

    const slug = createSlug(title);
    const newCard = {
      name: title,
      slug,
      path: `/feature/${slug}`,
      content,
      email,
      address,
      image,
    };

    addCard(newCard);
    navigate(`/feature/${slug}`);
  };

  return (
    <div className="new-card-form-container">
      <h2>Add New Card</h2>
      <form onSubmit={handleSubmit} className="new-card-form">
        <div className="form-group">
          <label htmlFor="title">
            Title:<span className="required-asterisk">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">
            Content:<span className="required-asterisk">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            required
            className={errors.content ? 'input-error' : ''}
          />
          {errors.content && (
            <span className="error-message">{errors.content}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email:<span className="required-asterisk">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">
            Address:<span className="required-asterisk">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter address"
            required
            className={errors.address ? 'input-error' : ''}
          />
          {errors.address && (
            <span className="error-message">{errors.address}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">
            Image:
            <span className="required-asterisk">*</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className={errors.image ? 'input-error' : ''}
          />
          {errors.image && (
            <span className="error-message">{errors.image}</span>
          )}
        </div>

        <button type="submit" className="submit-button">
          Add New Card
        </button>
      </form>
    </div>
  );
};

export default NewCardForm;

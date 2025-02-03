// src/components/NewCardForm/NewCardForm.jsx
// NewCardForm.jsx: מאפשר למשתמש להזין נתונים חדשים, מחשב slug, מוסיף את הכרטיס החדש ל־Context, ומנווט אוטומטית לנתיב הדינמי שלו.

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardsContext } from '../../CardsContext';
import "./NewCardForm.css";

const NewCardForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);

  const navigate = useNavigate();
  const { addCard } = useContext(CardsContext);

  // פונקציה ליצירת slug מהכותרת: המרה לאותיות קטנות, הסרת רווחים מיותרים והחלפת רווחים במקף
  const createSlug = (title) => title.toLowerCase().trim().replace(/\s+/g, '-');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = createSlug(title);
    const newCard = {
      name: title,
      slug,
      path: `/feature/${slug}`,
      content,
      email,
      address,
      image
    };

    addCard(newCard);
    navigate(`/feature/${slug}`);
  };

  return (
    <div className="new-card-form-container">
      <h2>Add New Card</h2>
      <form onSubmit={handleSubmit} className="new-card-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image:</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add New Card
        </button>
      </form>
    </div>
  );
};

export default NewCardForm;

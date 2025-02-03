// src/components/EditCardForm/EditCardForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CardsContext } from '../../CardsContext';
import "./EditCardForm.css";

const EditCardForm = () => {
  const { cardSlug } = useParams();
  const { cards, updateCard } = useContext(CardsContext);
  const navigate = useNavigate();

  // מציאת הכרטיסייה לפי ה-slug
  const cardToEdit = cards.find((card) => card.slug === cardSlug);

  // קריאת ה־Hooks תמיד, גם אם cardToEdit לא נמצא – משתמשים בערכי ברירת מחדל במקרה כזה
  const [title, setTitle] = useState(cardToEdit ? cardToEdit.name : "");
  const [content, setContent] = useState(cardToEdit ? cardToEdit.content : "");
  const [email, setEmail] = useState(cardToEdit ? cardToEdit.email || '' : "");
  const [address, setAddress] = useState(cardToEdit ? cardToEdit.address || '' : "");
  const [image, setImage] = useState(cardToEdit ? cardToEdit.image || null : null);

  // כעת, לאחר שקראנו את כל ה־Hooks, נבדוק אם לא נמצא כרטיס
  if (!cardToEdit) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Card not found
      </div>
    );
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // פונקציה ליצירת slug מהכותרת (המרה לאותיות קטנות והחלפת רווחים במקף)
  const createSlug = (title) => title.toLowerCase().trim().replace(/\s+/g, '-');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSlug = createSlug(title);

    // עדכון הכרטיס עם הנתונים החדשים, כולל נתיב חדש אם הכותרת השתנתה
    updateCard(cardSlug, {
      name: title,
      slug: newSlug,
      path: `/feature/${newSlug}`,
      content,
      email,
      address,
      image,
    });

    // ננווט לעמוד הכרטיס המעודכן
    navigate(`/feature/${newSlug}`);
  };

  return (
    <div className="edit-card-form-container">
      <h2>Edit Card</h2>
      <form onSubmit={handleSubmit} className="edit-card-form">
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
          />
        </div>
        <button type="submit" className="submit-button">
          Update Card
        </button>
      </form>
    </div>
  );
};

export default EditCardForm;

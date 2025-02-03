// src/pages/features/CardPage.jsx
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CardsContext } from '../../CardsContext';
import './CardPage.css';

const CardPage = () => {
  const { cardSlug } = useParams();
  const { cards } = useContext(CardsContext);

  // חיפוש הכרטיסייה לפי ה-slug
  const card = cards.find(c => c.slug === cardSlug);

  if (!card) {
    return (
      <div className="card-page-container">
        <h2>Card not found</h2>
        <Link to="/" className="card-button">Back Home</Link>
      </div>
    );
  }

  return (
    <div className="card-page-container">
      <div className="card-page">
        <h2 className="card-title">{card.name}</h2>
        <p className="card-content">{card.content}</p>
        {card.email && <p className="card-email">Email: {card.email}</p>}
        {card.address && <p className="card-address">Address: {card.address}</p>}
        {card.image && (
          <div className="card-image-container">
            <img
              src={URL.createObjectURL(card.image)}
              alt={card.name}
              className="card-image"
            />
          </div>
        )}
        <div className="card-buttons">
          {/* כפתור העדכון מוביל לעמוד העריכה עם הנתיב /edit/:cardSlug */}
          <Link to={`/edit/${card.slug}`} className="card-button">
            Update Card
          </Link>
          <Link to="/" className="card-button">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardPage;

// CardPage Component
// in: 
//    - Uses useParams to extract the "cardSlug" parameter from the URL.
//    - Uses CardsContext to access the list of cards.
//    - Reads the user cookie to determine the user's role.
// out: 
//    - Finds and displays the details of a specific card based on the slug.
//    - If the card is not found, shows a "Card not found" message and a link to go back home.
//    - If the card is found, renders its title, status, contact details, description, and image.
//    - For users with the "user" role and if the card is open, shows a link to update the card.
//    - Always includes a "Back Home" link for navigation.
// Additional: This page provides a detailed view of a single card, adapting its content based on the user's role.

import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CardsContext } from '../../CardsContext';
import './CardPage.css';

const CardPage = () => {
  const { cardSlug } = useParams();
  const { cards } = useContext(CardsContext);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

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
        <h2 className="card-title">{card.title || card.name}</h2>

        {/* Display card status */}
        <div className={`card-status ${card.status === 'closed' ? 'status-closed' : 'status-open'}`}>
          {card.status ? card.status.toUpperCase() : 'OPEN'}
        </div>

        {/* Card details */}
        <div className="card-details">
          <p><strong>Full Name:</strong> {card.fullName}</p>
          <p><strong>Phone Number:</strong> {card.phoneNumber}</p>
          <p><strong>City:</strong> {card.city}</p>
          <p><strong>Street:</strong> {card.street}</p>
        </div>

        <p className="card-content">{card.description || card.content}</p>

        {/* Display card image */}
        {card.image && (
          <div className="card-image-container">
            <img
              src={`data:image/jpeg;base64,${card.image}`}
              alt={card.title || card.name}
              className="card-image"
            />
          </div>
        )}

        <div className="card-buttons">
          {/* Show the "Update Card" button only for users and for open cards */}
          {userRole === 'user' && card.status !== 'closed' && (
            <Link to={`/edit/${card.slug}`} className="card-button">
              Update Card
            </Link>
          )}
          <Link to="/" className="card-button">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardPage;
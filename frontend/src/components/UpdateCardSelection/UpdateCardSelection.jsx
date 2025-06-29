// UpdateCardSelection Component
// in: Uses React hooks (useContext, useState, useEffect) to retrieve card data and deletion functionality from CardsContext,
//     and reads the user role from cookies.
// out: Renders a list of cards where:
//      - For 'admin' users, it displays a delete button with a confirmation prompt.
//      - For 'user' users, it provides a link to update the selected card.
// Additional: This component dynamically adjusts its UI based on the user's role, which is determined from the user cookie.
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CardsContext } from '../../contexts/CardsContext';
import { USER_ROLES } from '../../constants'; // Import the roles constant!
import "./UpdateCardSelection.css";

const UpdateCardSelection = () => {
  const { cards, deleteCard } = useContext(CardsContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  return (
    <div className="update-card-selection-container">
      <h2>
        {userRole === USER_ROLES.USER
          ? 'Select a Card to Update'
          : 'Select a Card to Delete'}
      </h2>
      <ul className="card-selection-list">
        {cards.map((card, index) => (
          <li key={index} className="card-selection-item">
            {userRole === USER_ROLES.ADMIN && (
              <div className="delete-section">
                {deleteConfirm === card.slug ? (
                  <div className="delete-confirmation">
                    <span>Are you sure?</span>
                    <button
                      onClick={() => {
                        deleteCard(card.slug);
                        setDeleteConfirm(null);
                      }}
                      className="confirm-delete-button"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="cancel-delete-button"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(card.slug)}
                    className="delete-icon"
                  >
                    &#x2212;
                  </button>
                )}
              </div>
            )}
            <div className="card-info">
              <span className="card-name">{card.title || 'Untitled Card'}</span>
              <span className="card-id">ID: {card.id || 'N/A'}</span>
            </div>
            {userRole === USER_ROLES.USER && (
              <Link to={`/edit/${card.slug}`} className="update-card-button">
                Update
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className="navigation-buttons">
        <Link to="/" className="back-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default UpdateCardSelection;

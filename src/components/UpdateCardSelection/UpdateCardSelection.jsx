// src/components/UpdateCardSelection/UpdateCardSelection.jsx
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CardsContext } from '../../CardsContext';
import "./UpdateCardSelection.css";

const UpdateCardSelection = () => {
  const { cards, deleteCard } = useContext(CardsContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  return (
    <div className="update-card-selection-container">
      <h2>Select a Card to Update</h2>
      <ul className="card-selection-list">
        {cards.map((card, index) => (
          <li key={index} className="card-selection-item">
            <div className="delete-section">
              {deleteConfirm === card.slug ? (
                <div className="delete-confirmation">
                  <span>Are you sure?</span>
                  <button
                    onClick={() => {
                      deleteCard(card.slug);
                      setDeleteConfirm(null);
                    }}
                    className="confirm-delete-button">
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="cancel-delete-button">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(card.slug)}
                  className="delete-icon">
                  &#x2212;
                </button>
              )}
            </div>
            <span className="card-name">{card.name}</span>
            <Link to={`/edit/${card.slug}`} className="update-card-button">
              Update
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpdateCardSelection;

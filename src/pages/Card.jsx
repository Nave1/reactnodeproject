// src/components/Card/Card.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../src/App.css';

const Card = ({
  card,
  role,
  onDelete,
  onClose,
  isSelected,
  onSelect
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    onDelete(card.slug);
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(card.slug);
  };

  const handleCloseTask = (e) => {
    e.stopPropagation();
    onClose(card.slug);
  };

  return (
    <div className={`card ${card.status === 'closed' ? 'card-closed' : 'card-open'}`}>
      {role === 'admin' && (
        <>
          {showConfirmDelete ? (
            <div className="delete-confirmation">
              <p>Are you sure?</p>
              <div className="delete-buttons">
                <button className="confirm-delete-button" onClick={handleConfirmDelete}>Yes</button>
                <button className="cancel-delete-button" onClick={handleCancelDelete}>No</button>
              </div>
            </div>
          ) : (
            <button className="delete-icon" onClick={handleDeleteClick}>✕</button>
          )}

          {card.status !== 'closed' && (
            <div className="select-container">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                className="select-checkbox"
              />
              <span className="tooltip">Select to close</span>
            </div>
          )}
        </>
      )}

      <div className="card-status-badge">
        {card.status === 'closed' ? 'CLOSED' : 'OPEN'}
      </div>

      <div className="card-content">
        <h3 className="card-title">{card.title}</h3>
        <p className="card-id">ID: {card.id}</p>

        <div className="card-actions">
          <Link to={`/feature/${card.slug}`} className="view-details-button">
            View Details
          </Link>

          {role === 'admin' && isSelected && card.status !== 'closed' && (
            <button onClick={handleCloseTask} className="close-task-button">
              Close Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
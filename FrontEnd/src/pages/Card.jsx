import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../src/App.css';

const Card = ({ card, userInfo, onDelete, onClose, isSelected, onSelect }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isAdmin = userInfo?.role === 'admin';

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
    <div className={`project-list-item card ${card.status === 'closed' ? 'card-closed' : 'card-open'} has-status`}>
      <div className={`card-status-indicator status-${card.status}`}>{card.status.toUpperCase()}</div>

      {/* Admin Delete */}
      {isAdmin && (
        showConfirmDelete ? (
          <div className="delete-confirmation">
            <p>Are you sure?</p>
            <div className="delete-buttons">
              <button className="confirm-delete-button" onClick={handleConfirmDelete}>Yes</button>
              <button className="cancel-delete-button" onClick={handleCancelDelete}>No</button>
            </div>
          </div>
        ) : (
          <button className="delete-icon" onClick={handleDeleteClick}>✕</button>
        )
      )}

      {/* Admin Close checkbox */}
      {isAdmin && card.status !== 'closed' && (
        <input
          type="checkbox"
          className="select-checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
      )}

      {/* Card Owner ID */}
      {isAdmin && (
        <div className="card-owner-badge">
          {card.user_id === userInfo.id ? 'Your Card' : `User ID: ${card.user_id}`}
        </div>
      )}

      <h3>{card.title}</h3>
      <p className="card-id">ID: {card.id}</p>
      <Link to={`/feature/${card.slug}`} className="project-link">View Details</Link>

      {isAdmin && isSelected && card.status !== 'closed' && (
        <button onClick={handleCloseTask} className="close-task-button">
          Close Task
        </button>
      )}
    </div>
  );
};

export default Card;
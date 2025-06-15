// Card Component
// in: 
//    - card: Object containing details about the card (title, id, slug, status, etc.).
//    - role: User role (e.g., 'admin') determining which actions are available.
//    - onDelete: Callback function to delete the card.
//    - onClose: Callback function to close the card's task.
//    - isSelected: Boolean indicating whether the card is currently selected.
//    - onSelect: Callback function to toggle the card's selection.
// out: 
//    - Renders a card with its details (title, id, status) and various interactive elements.
//    - For admin users:
//         • Displays a delete icon that, when clicked, shows a confirmation prompt.
//         • Shows a checkbox to select the card for closing (if the card is not already closed).
//         • Displays a "Close Task" button if the card is selected and open.
//    - For all users:
//         • Always displays the card's status badge (OPEN or CLOSED) and a "View Details" link.
// Additional: This component handles event propagation carefully to ensure that clicks on interactive elements 
//             (like the delete button, checkbox, or close task button) do not trigger unintended parent actions.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../src/App.css';
import { USER_ROLES, STATUS } from '../constants';

const Card = ({ card, userInfo, onDelete, onClose, isSelected, onSelect }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isAdmin = userInfo?.role === USER_ROLES.ADMIN;

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
    <div className={`project-list-item card ${card.status === STATUS.CLOSED ? 'card-closed' : 'card-open'} has-status`}>
      <div className={`card-status-indicator status-${card.status}`}>{card.status.toUpperCase()}</div>

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

      {isAdmin && card.status !== STATUS.CLOSED && (
        <input
          type="checkbox"
          className="select-checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
      )}

      {isAdmin && (
        <div className="card-owner-badge">
          {card.user_id === userInfo.id ? 'Your Card' : `User ID: ${card.user_id}`}
        </div>
      )}

      <h3>{card.title}</h3>
      <p className="card-id">ID: {card.id}</p>
      <Link to={`/feature/${card.slug}`} className="project-link">View Details</Link>

      {isAdmin && isSelected && card.status !== STATUS.CLOSED && (
        <button onClick={handleCloseTask} className="close-task-button">
          Close Task
        </button>
      )}
    </div>
  );
};

export default Card;

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
import { CardsContext } from '../../contexts/CardsContext';
import { USER_ROLES, STATUS } from '../../constants';
import './CardPage.css';

const CardPage = () => {
  const { cardSlug } = useParams();
  const { cards } = useContext(CardsContext);
  const [userRole, setUserRole] = useState(null);

  // New: Status history state
  const [statuses, setStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [statusError, setStatusError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [addingStatus, setAddingStatus] = useState(false);

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

  // Fetch all status history for this card
  useEffect(() => {
    if (!card) {
      setStatuses([]);
      setLoadingStatuses(false);
      return;
    }
    const fetchStatuses = async () => {
      setLoadingStatuses(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cards/${card.slug}/statuses`, {
          credentials: 'include', // if you use cookies for auth
        });
        if (!response.ok) throw new Error('Failed to fetch statuses');
        const data = await response.json();
        setStatuses(data);
      } catch (err) {
        setStatuses([]);
      }
      setLoadingStatuses(false);
    };
    fetchStatuses();
  }, [card]);

  // Handle admin adding a new status
  const handleAddStatus = async () => {
    setStatusError('');
    if (!newStatus.trim()) {
      setStatusError('Status text cannot be empty.');
      return;
    }
    setAddingStatus(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cards/${card.slug}/statuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // if you use cookies for auth
        body: JSON.stringify({ status_text: newStatus }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add status');
      }
      setNewStatus('');
      // Refresh status list
      const refresh = await fetch(`${process.env.REACT_APP_API_URL}/api/cards/${card.slug}/statuses`, {
        credentials: 'include',
      });
      setStatuses(await refresh.json());
    } catch (err) {
      setStatusError(err.message);
    }
    setAddingStatus(false);
  };

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
        <div className={`card-status ${card.status === STATUS.CLOSED ? 'status-closed' : 'status-open'}`}>
          {card.status ? card.status.toUpperCase() : STATUS.OPEN.toUpperCase()}
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

        {/* Status History Section */}
        <div className="card-status-section">
          <h3>Status History</h3>
          {loadingStatuses ? (
            <div>Loading status history...</div>
          ) : statuses.length > 0 ? (
            <ul>
              {statuses.map((s, idx) => (
                <li key={idx}>
                  <div className="status-date">
                    {new Date(s.status_date).toLocaleString()}
                  </div>
                  <div className="status-text">{s.status_text}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="status-empty">There is no status yet.</div>
          )}
        </div>

        {/* Admin: Add new status */}
        {userRole === USER_ROLES.ADMIN && (
          <div className="add-status-section">
            <input
              type="text"
              placeholder="Enter new status"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              disabled={addingStatus}
              className="card-input"
            />
            <button onClick={handleAddStatus} disabled={addingStatus} className="card-button" >
              {addingStatus ? 'Adding...' : 'Add Status'}
            </button>
            {statusError && <div className="status-error">{statusError}</div>}
          </div>
        )}

        <div className="card-buttons">
          {userRole === USER_ROLES.USER && card.status !== STATUS.CLOSED && (
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

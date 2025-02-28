// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import HeroSection from '../components/HomeHero/HomeHero';
import { CardsContext } from '../CardsContext';
import About from './About';
import Contact from './Contact';
import defaultImage from '../assets/cleanCity.jpg';
import "../App.css";

const Home = () => {
  const { cards, loading, error, deleteCard, closeTask } = useContext(CardsContext);
  const [role, setRole] = useState(null);
  const [selectedCards, setSelectedCards] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'open', or 'closed'
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setRole(userData.role);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

  // Filter cards based on status
  const filteredCards = filterStatus === 'all'
    ? cards
    : cards.filter(card => card.status === filterStatus);

  // If no user is logged in, display HeroSection, default image, About, and Contact
  if (!role) {
    return (
      <>
        <HeroSection />
        <div className="home-container">
          <img src={defaultImage} alt="Default" className="default-image" />
          <About />
          <Contact />
        </div>
      </>
    );
  }

  // Toggle card selection
  const handleCardSelect = (slug) => {
    setSelectedCards(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  // Handle closing a task
  const handleCloseTask = async (slug) => {
    const result = await closeTask(slug);
    if (result.success) {
      // Reset the selection state
      setSelectedCards(prev => ({
        ...prev,
        [slug]: false
      }));
    } else {
      alert(result.message || 'Failed to close task');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (slug) => {
    setConfirmDelete(slug);
  };

  const handleConfirmDelete = async (slug) => {
    const result = await deleteCard(slug);
    if (result.success) {
      setConfirmDelete(null);
    } else {
      alert(result.message || 'Failed to delete card');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0062e6',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
            <h2>Loading cards...</h2>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div style={{
          maxWidth: '600px',
          margin: '2rem auto',
          padding: '1.5rem',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <div className="home-container">
        {/* Status filter buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Cards
          </button>
          <button
            className={`filter-button ${filterStatus === 'open' ? 'active' : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Open Cards
          </button>
          <button
            className={`filter-button ${filterStatus === 'closed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('closed')}
          >
            Closed Cards
          </button>
        </div>

        {/* Cards list */}
        {filteredCards && filteredCards.length > 0 ? (
          <ul className="project-list">
            {filteredCards.map((card) => (
              <li
                key={card.slug}
                className={`project-list-item has-status ${card.status === 'closed' ? 'card-closed' : 'card-open'}`}
              >
                {/* Status indicator bar */}
                <div className={`card-status-indicator ${card.status === 'closed' ? 'status-closed' : 'status-open'}`}>
                  {card.status === 'closed' ? 'CLOSED' : 'OPEN'}
                </div>

                {/* Admin controls */}
                {role === 'admin' && (
                  <>
                    {confirmDelete === card.slug ? (
                      <div className="delete-confirmation">
                        <p>Are you sure?</p>
                        <div className="delete-buttons">
                          <button
                            className="confirm-delete-button"
                            onClick={() => handleConfirmDelete(card.slug)}
                          >
                            Yes
                          </button>
                          <button
                            className="cancel-delete-button"
                            onClick={handleCancelDelete}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="delete-icon"
                        onClick={() => handleDeleteClick(card.slug)}
                      >
                        ✕
                      </button>
                    )}

                    {card.status !== 'closed' && (
                      <input
                        type="checkbox"
                        className="select-checkbox"
                        checked={selectedCards[card.slug] || false}
                        onChange={() => handleCardSelect(card.slug)}
                      />
                    )}
                  </>
                )}

                {/* Card content */}
                <h3>{card.title}</h3>
                <p className="card-id">ID: {card.id}</p>

                {/* View Details link */}
                <Link to={`/feature/${card.slug}`} className="project-link">
                  View Details
                </Link>

                {/* Close task button - only visible when checkbox is checked */}
                {role === 'admin' &&
                  selectedCards[card.slug] &&
                  card.status !== 'closed' && (
                    <button
                      onClick={() => handleCloseTask(card.slug)}
                      className="close-task-button"
                    >
                      Close Task
                    </button>
                  )}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{
            margin: '3rem auto',
            textAlign: 'center',
            maxWidth: '600px',
            padding: '2rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h2>No {filterStatus !== 'all' ? filterStatus : ''} cards available</h2>
            {role === 'user' && (
              <p style={{ marginTop: '1rem', color: '#666' }}>
                Click "Add New Card" below to create your first card.
              </p>
            )}
          </div>
        )}

        {/* Add/Update card buttons for users */}
        {role === 'user' && (
          <div className="button-group">
            <Link to="/form" className="add-card-button">
              Add New Card
            </Link>
            <Link to="/update" className="update-card-home-button">
              Update Card
            </Link>
          </div>
        )}

        {/* Display About and Contact sections at the bottom */}
        <About />
        <Contact />
      </div>
    </>
  );
};

export default Home;
// Home Component
// in: 
//    - Uses React hooks (useContext, useEffect, useState) to manage state and side effects.
//    - Reads data from CardsContext: cards, loading, error, deleteCard, closeTask.
//    - Uses Cookies to determine the logged-in user's role.
//    - Uses React Router's Link for navigation.
// out:
//    - For non-logged-in users, displays the landing page including HeroSection, a default image, About, and Contact sections.
//    - For logged-in users, displays a list of cards filtered by status (all, open, or closed).
//      Provides admin controls (delete, select, close task) and user options (links to add or update cards).
// Additional: 
//    - Includes status filtering via buttons.
//    - Displays loading and error messages if applicable.
//    - Renders About and Contact sections at the bottom for further information.

import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HomeHero/HomeHero';
import { CardsContext } from '../CardsContext';
import About from './About';
import Contact from './Contact';
import defaultImage from '../assets/cleanCity.jpg';
import Card from '../../src/pages/Card';
import '../App.css';
import Cookies from 'js-cookie';

const Home = () => {
  const {
    cards,
    loading,
    error,
    fetchCards,
    deleteCard,
    closeTask,
  } = useContext(CardsContext);

  const [selectedCards, setSelectedCards] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [userInfo, setUserinfo] = useState(null);

  // // Helper to get user from cookie
  // const getUserFromCookie = () => {
  //   const storedUser = Cookies.get('user');
  //   if (!storedUser) return null;
  //   try {
  //     return JSON.parse(storedUser);
  //   } catch {
  //     return null;
  //   }
  // };

  // Sync user and fetch cards on mount and when page regains focus
useEffect(() => {
  const syncUserAndFetch = () => {
    const storedUser = Cookies.get('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    setUserinfo(user);
    if (user) fetchCards();
  };

  const handleLogoutEvent = () => {
    setUserinfo(null); // 🔁 React will re-render & show HeroSection
  };

  window.addEventListener('focus', syncUserAndFetch);
  window.addEventListener('user-logged-out', handleLogoutEvent);

  syncUserAndFetch();

  return () => {
    window.removeEventListener('focus', syncUserAndFetch);
    window.removeEventListener('user-logged-out', handleLogoutEvent);
  };
}, [fetchCards]);


  const filteredCards = filterStatus === 'all'
    ? cards
    : cards.filter(card => card.status === filterStatus);

  const handleCardSelect = slug => {
    setSelectedCards(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleCloseTask = async slug => {
    const result = await closeTask(slug);
    if (result.success) {
      setSelectedCards(prev => ({ ...prev, [slug]: false }));
    } else {
      alert(result.message || 'Failed to close task');
    }
  };

  const handleDeleteCard = async slug => {
    const result = await deleteCard(slug);
    if (!result.success) {
      alert(result.message || 'Failed to delete card');
    }
  };

  // Not logged in: show landing page
  if (!userInfo) {
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

  // Loading or error states
  if (loading) return <div className="home-container">Loading cards...</div>;
  if (error) return <div className="home-container">Error loading cards</div>;

  return (
    <>
      <HeroSection />
      <div className="home-container">
        <div className="filter-buttons">
          {['all', 'open', 'closed'].map(status => (
            <button
              key={status}
              className={`filter-button ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} Cards
            </button>
          ))}
        </div>

        {filteredCards.length > 0 ? (
          <ul className="project-list">
            {filteredCards.map(card => (
              <li key={card.slug} style={{ listStyle: 'none' }}>
                <Card
                  card={card}
                  userInfo={userInfo}
                  onDelete={handleDeleteCard}
                  onClose={handleCloseTask}
                  isSelected={selectedCards[card.slug]}
                  onSelect={handleCardSelect}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-cards-placeholder">
            <h2>No {filterStatus !== 'all' ? filterStatus : ''} cards</h2>
            <p>Try adding a new one!</p>
          </div>
        )}

        <div className="button-group">
          <Link to="/form" className="add-card-button">Add New Card</Link>
          <Link to="/update" className="update-card-home-button">Update Card</Link>
        </div>

        <About />
        <Contact />
      </div>
    </>
  );
};

export default Home;

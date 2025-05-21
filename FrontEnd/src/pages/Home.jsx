import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HomeHero/HomeHero';
import { CardsContext } from '../CardsContext';
import About from './About';
import Contact from './Contact';
import defaultImage from '../assets/cleanCity.jpg';
import Card from '../pages/Card';
import '../App.css';

const Home = () => {
  const {
    cards,
    loading,
    error,
    userInfo,
    fetchCards,
    deleteCard,
    closeTask,
  } = useContext(CardsContext);

  const [selectedCards, setSelectedCards] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (userInfo) fetchCards();
  }, [userInfo, fetchCards]);

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
              <li key={card.slug}>
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
// src/pages/index.jsx (Home.jsx)
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HomeHero/HomeHero';
import { CardsContext } from '../CardsContext';
import "../App.css";

const Home = () => {
  const { cards } = useContext(CardsContext);

  return (
    <>
      <HeroSection />
      <div className="home-container">
        <h2>Click on a feature to learn more:</h2>
        <ul className="project-list">
          {cards.map((card, index) => (
            <li key={index} className="project-list-item">
              <Link to={card.path} className="project-link">
                {card.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="button-group">
          <Link to="/form" className="add-card-button">
            Add New Card
          </Link>
          <Link to="/update" className="update-card-home-button">
            Update Existing Card
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;

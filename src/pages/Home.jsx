// src/pages/index.jsx (או Home.jsx)
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HomeHero/HomeHero';
import { CardsContext } from '../CardsContext';
import "../App.css";

const Home = () => {
  const { cards, deleteCard } = useContext(CardsContext);
  // state למחיקת כרטיסייה – מאחסן את ה-slug של הכרטיס שצריך אישור מחיקה
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  return (
    <>
      <HeroSection />
      <div className="home-container">
        <h2>Click on a feature to learn more:</h2>
        <ul className="project-list">
          {cards.map((card, index) => (
            <li key={index} className="project-list-item">
              {/* אייקון מחיקה שממוקם בפינה הימנית העליונה של הכרטיס */}
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
                  title="Delete Card"
                >
                  &#x2715;
                </button>
              )}

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

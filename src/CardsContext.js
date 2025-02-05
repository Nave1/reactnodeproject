// src/CardsContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CardsContext = createContext();

export const CardsProvider = ({ children }) => {
  // רשימת הכרטיסיות הקבועות (initialCards)
  const initialCards = [
    {
      name: 'User-friendly web interface',
      slug: 'user-friendly-web-interface',
      path: '/feature/user-friendly-web-interface',
      content: 'Content for User-friendly web interface.'
    },
    {
      name: 'Interactive map',
      slug: 'interactive-map',
      path: '/feature/interactive-map',
      content: 'Content for Interactive map.'
    },
    {
      name: 'Real-time updates',
      slug: 'real-time-updates',
      path: '/feature/real-time-updates',
      content: 'Content for Real-time updates.'
    },
    {
      name: 'Notifications for city councils',
      slug: 'notifications-for-city-councils',
      path: '/feature/notifications-for-city-councils',
      content: 'Content for Notifications for city councils.'
    },
    {
      name: 'Efficient database',
      slug: 'efficient-database',
      path: '/feature/efficient-database',
      content: 'Content for Efficient database.'
    },
    {
      name: 'Mobile-friendly design',
      slug: 'mobile-friendly-design',
      path: '/feature/mobile-friendly-design',
      content: 'Content for Mobile-friendly design.'
    }
  ];

  // ננסה לטעון את הכרטיסיות מ־localStorage אם קיימות, אחרת נשתמש ב-initialCards
  const storedCards = localStorage.getItem('cards');
  const defaultCards = storedCards ? JSON.parse(storedCards) : initialCards;

  const [cards, setCards] = useState(defaultCards);

  // כל פעם שהכרטיסיות משתנות, נעדכן את ה-localStorage
  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  const addCard = (newCard) => {
    setCards([...cards, newCard]);
  };

  const updateCard = (slug, updatedData) => {
    setCards(
      cards.map((card) =>
        card.slug === slug ? { ...card, ...updatedData } : card
      )
    );
  };

  const deleteCard = (slug) => {
    setCards(cards.filter((card) => card.slug !== slug));
  };

  return (
    <CardsContext.Provider value={{ cards, addCard, updateCard, deleteCard }}>
      {children}
    </CardsContext.Provider>
  );
};

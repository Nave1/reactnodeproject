// src/CardsContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CardsContext = createContext();

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState([]);

  // Function to fetch cards from the database
  const fetchCards = async () => {
    try {
      const response = await axios.get('http://localhost:5001/cards');
      setCards(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  };

  // Fetch cards when the provider mounts
  useEffect(() => {
    fetchCards();
  }, []);

  // Function to add a card (expects FormData)
  const addCard = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5001/cards', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchCards();
      return response.data; // Now contains slug too
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  // Function to update a card (expects FormData)
  // Updated to return a promise so we can await it
  const updateCard = async (slug, formData) => {
    try {
      // First find the card by slug to get its ID
      const cardToUpdate = cards.find(card => card.slug === slug);

      if (!cardToUpdate) {
        throw new Error('Card not found with slug: ' + slug);
      }

      // Use the card's ID for the backend API call
      const response = await axios.put(`http://localhost:5001/cards/${cardToUpdate.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refetch all cards to ensure we have the latest data
      await fetchCards();
      return response.data; // Contains the new slug if title was changed
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  // Function to delete a card
  const deleteCard = async (slug) => {
    try {
      const response = await axios.delete(`http://localhost:5001/cards/${slug}`);
      await fetchCards();
      return response.data;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  // Function to close a card (set status to "closed")
  const closeTask = async (slug) => {
    try {
      const response = await axios.put(`http://localhost:5001/cards/${slug}/close`);
      await fetchCards();
      return response.data;
    } catch (error) {
      console.error('Error closing card:', error);
      throw error;
    }
  };

  return (
    <CardsContext.Provider value={{ cards, addCard, updateCard, deleteCard, closeTask }}>
      {children}
    </CardsContext.Provider>
  );
};
// CardsContext.js
// in: No props are passed to this provider.
// out: Provides a global context containing the list of cards and functions to fetch, add, update, delete, and close cards.
// Additional: Wraps the application with CardsContext.Provider so that child components can access card-related state and actions.
import React, { createContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { api } from '../api/api';

export const CardsContext = createContext();

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/cards');
      setCards(data);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userInfo) fetchCards();
  }, [userInfo, fetchCards]);

  const addCard = async (formData) => {
    try {
      const response = await api.post('/cards', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error adding card:', err);
      return { success: false, message: err.response?.data?.message || 'Error adding card' };
    }
  };

  const updateCard = async (slug, formData) => {
    try {
      const response = await api.put(`/cards/${slug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error updating card:', err);
      return { success: false, message: err.response?.data?.message || 'Error updating card' };
    }
  };

  const deleteCard = async (slug) => {
    try {
      const response = await api.delete(`/cards/${slug}`);
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error deleting card:', err);
      return { success: false, message: err.response?.data?.message || 'Error deleting card' };
    }
  };

  const closeTask = async (slug) => {
    try {
      const response = await api.put(`/cards/${slug}/close`);
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error closing task:', err);
      return { success: false, message: err.response?.data?.message || 'Error closing task' };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password });
      if (data.success) {
        Cookies.set('user', JSON.stringify(data.user), { expires: 1 });
        setUserInfo(data.user);
      }
      return data;
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    Cookies.remove('user');
    setUserInfo(null);
    setCards([]);
  };

  return (
    <CardsContext.Provider value={{
      cards,
      loading,
      error,
      userInfo,
      fetchCards,
      addCard,
      updateCard,
      deleteCard,
      closeTask,
      login,
      logout,
    }}>
      {children}
    </CardsContext.Provider>
  );
};

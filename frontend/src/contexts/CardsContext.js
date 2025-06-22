// CardsContext.js
// in: No props are passed to this provider.
// out: Provides a global context containing the list of cards and functions to fetch, add, update, delete, and close cards.
// Additional: Wraps the application with CardsContext.Provider so that child components can access card-related state and actions.
// CardsContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { api } from '../api/api';

export const CardsContext = createContext();

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Fetch detailed user info including points
  const fetchUserInfo = useCallback(async () => {
    try {
      const { data } = await api.get('/api/me');
      setUserInfo(data);
      Cookies.set('user', JSON.stringify({
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        points: data.points
      }), { expires: 1 });
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  }, []);

  // On mount, set userInfo from cookie, then fetch full info (for points)
  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
        fetchUserInfo(); // Always update with live info, including points
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
  }, [fetchUserInfo]);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/cards');
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
      const response = await api.post('/api/cards', formData, {
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
      const response = await api.put(`/api/cards/${slug}`, formData, {
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
      const response = await api.delete(`/api/cards/${slug}`);
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error deleting card:', err);
      return { success: false, message: err.response?.data?.message || 'Error deleting card' };
    }
  };

  // When a card is closed, also refresh user info to update points!
  const closeTask = async (slug) => {
    try {
      const response = await api.put(`/api/cards/${slug}/close`);
      fetchCards();
      await fetchUserInfo(); // Fetch updated points after closing card
      return response.data;
    } catch (err) {
      console.error('Error closing task:', err);
      return { success: false, message: err.response?.data?.message || 'Error closing task' };
    }
  };

  // Update login to immediately fetch full info (with points) after successful login
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/login', { email, password });
      if (data.success) {
        const minimalUser = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          firstName: data.user.firstName
        };
        Cookies.set('user', JSON.stringify(minimalUser), { expires: 1 });
        setUserInfo(minimalUser);
        await fetchUserInfo(); // This ensures points are loaded after login
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
      fetchUserInfo, // Exported in case you want to manually refresh
    }}>
      {children}
    </CardsContext.Provider>
  );
};

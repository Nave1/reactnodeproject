// src/CardsContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from './api';

export const CardsContext = createContext();

export const CardsProvider = ({ children }) => {
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Rehydrate userInfo from cookie on app start
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

  // Wrap fetchCards in useCallback to stabilize its identity
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/cards', { withCredentials: true });
      setCards(data);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cards when userInfo changes
  useEffect(() => {
    if (userInfo) {
      fetchCards();
    }
  }, [userInfo, fetchCards]);

  const addCard = async (formData) => {
    try {
      const response = await api.post(
        '/cards',
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error adding card:', err);
      return { success: false, message: err.response?.data?.message || 'Error adding card' };
    }
  };

  const updateCard = async (slug, formData) => {
    try {
      const response = await api.put(
        `/cards/${slug}`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error updating card:', err);
      return { success: false, message: err.response?.data?.message || 'Error updating card' };
    }
  };

  const deleteCard = async (slug) => {
    try {
      const response = await api.delete(`/cards/${slug}`, { withCredentials: true });
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error deleting card:', err);
      return { success: false, message: err.response?.data?.message || 'Error deleting card' };
    }
  };

  const closeTask = async (slug) => {
    try {
      const response = await api.put(`/cards/${slug}/close`, {}, { withCredentials: true });
      fetchCards();
      return response.data;
    } catch (err) {
      console.error('Error closing task:', err);
      return { success: false, message: err.response?.data?.message || 'Error closing task' };
    }
  };

  // Auth: login() populates userInfo and cookie
  const login = async (email, password) => {
    try {
      const { data } = await api.post(
        '/login',
        { email, password },
        { withCredentials: true }
      );
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
  setCards([]); // Clear card list
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

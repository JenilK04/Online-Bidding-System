import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile'); 
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchProfile(); // fetchProfile MUST set loading to false in the .finally() block
  } else {
    setLoading(false); // No token, so we are done loading (guest mode)
  }
}, []);

  const canParticipate = user?.status === 'active' && user?.isVerified;

  // 🔹 CONVERSION: Replacing JSX with React.createElement
  return React.createElement(
    AuthContext.Provider,
    { value: { user, setUser, loading, canParticipate, fetchProfile } },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
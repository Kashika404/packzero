
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8890/api'
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        setUser({ email: userEmail });
      }
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, email: userEmail } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', userEmail);
    setToken(token);
    setUser({ email: userEmail });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Here is the register function, defined within the provider
  const register = async (email, password) => {
    return api.post('/auth/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  // We explicitly add 'register' to the value object that the provider shares.
  const value = { user, login, logout, register, api };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
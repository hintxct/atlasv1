import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ------------------------------------------------------------------
// Demo accounts — used automatically when the backend API is
// unreachable, so the full platform works offline (demo preview).
// ------------------------------------------------------------------
const DEMO_ACCOUNTS = {
  '9876543210': {
    password: 'password123',
    user: { _id: 'demo-driver', name: 'Rajesh Kumar', phone: '9876543210', userType: 'driver', approvalStatus: 'approved', state: 'Assam', district: 'Kamrup', vehicleType: '10-ton Truck', rating: 4.8 },
  },
  '9876543211': {
    password: 'password123',
    user: { _id: 'demo-official', name: 'Priya Sharma', phone: '9876543211', userType: 'field_official', approvalStatus: 'approved', state: 'Meghalaya', district: 'East Khasi Hills' },
  },
  '9876543212': {
    password: 'password123',
    user: { _id: 'demo-admin', name: 'Anil Das', phone: '9876543212', userType: 'district_admin', approvalStatus: 'approved', state: 'Assam', district: 'Kamrup' },
  },
  '9876543213': {
    password: 'password123',
    user: { _id: 'demo-state', name: 'Meena Roy', phone: '9876543213', userType: 'state_admin', approvalStatus: 'approved', state: 'Assam' },
  },
};

const getRegisteredUsers = () => JSON.parse(localStorage.getItem('atlas_users') || '[]');

const normalizeUser = (userData = {}) => ({
  ...userData,
  name: userData.name || userData.fullName || 'Atlas User',
  fullName: userData.fullName || userData.name || 'Atlas User',
});

const demoLogin = (phone, password) => {
  const demo = DEMO_ACCOUNTS[phone];
  if (demo && demo.password === password) {
    return { token: `demo-token-${phone}`, user: demo.user };
  }
  const found = getRegisteredUsers().find((u) => u.phone === phone && u.password === password);
  if (found) {
      const { password: _pw, ...user } = found;
      return { token: `demo-token-${phone}`, user: normalizeUser(user) };
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (!storedToken.startsWith('demo-')) {
        socketService.connect(storedToken);
      }
    }

    setLoading(false);
  }, []);

  const establishSession = (newToken, userData) => {
    const normalizedUser = normalizeUser(userData);
    setToken(newToken);
    setUser(normalizedUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    socketService.disconnect();
    if (!newToken.startsWith('demo-')) {
      socketService.connect(newToken);
    }
  };

  // Explicit, browser-only demo sessions work with or without a running API.
  // They never create an administrator account or bypass backend authentication.
  const loginDemo = (phone) => {
    const demo = DEMO_ACCOUNTS[phone];
    if (!demo) return { success: false, message: 'Choose one of the demo roles below.' };
    const demoUser = normalizeUser(demo.user);
    establishSession(`demo-token-${phone}`, demoUser);
    return { success: true, user: demoUser, demo: true };
  };

  const login = async (phone, password) => {
    try {
      const response = await authAPI.login({ phone, password });
      const { token: newToken, ...userData } = response.data;
      const normalizedUser = normalizeUser(userData);
      establishSession(newToken, normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (error) {
      if (error.response) {
        return { success: false, message: error.response.data?.message || 'Login failed' };
      }
      // Backend unreachable → demo mode
      const session = demoLogin(phone, password);
      if (session) {
        establishSession(session.token, session.user);
        return { success: true, user: session.user, demo: true };
      }
      return { success: false, message: 'Invalid credentials. Use a demo account or register.' };
    }
  };

  const register = async (userData) => {
    try {
      const payload = { ...userData, fullName: userData.fullName || userData.name };
      const response = await authAPI.register(payload);
      const { token: newToken, ...user } = response.data;
      const normalizedUser = normalizeUser(user);
      establishSession(newToken, normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (error) {
      if (error.response) {
        return { success: false, message: error.response.data?.message || 'Registration failed' };
      }
      // Backend unreachable → demo mode
      const users = getRegisteredUsers();
      if (users.some((u) => u.phone === userData.phone) || DEMO_ACCOUNTS[userData.phone]) {
        return { success: false, message: 'This phone number is already registered.' };
      }
      const { password, ...safe } = userData;
      const newUser = {
        _id: `demo-${Date.now()}`,
        ...safe,
        fullName: safe.fullName || safe.name,
        name: safe.name || safe.fullName,
        approvalStatus: userData.userType === 'driver' ? 'approved' : 'pending',
      };
      users.push({ ...newUser, password });
      localStorage.setItem('atlas_users', JSON.stringify(users));
      establishSession(`demo-token-${userData.phone}`, newUser);
      return { success: true, user: newUser, demo: true };
    }
  };

  const logout = async () => {
    try {
      if (token && !token.startsWith('demo-')) await authAPI.logout();
    } catch (error) {
      // Offline / demo session — nothing to revoke server-side.
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      socketService.disconnect();
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginDemo,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

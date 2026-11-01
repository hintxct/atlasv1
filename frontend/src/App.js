import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicMapPage from './pages/PublicMapPage';
import StatisticsPage from './pages/StatisticsPage';
import MobileAppPage from './pages/MobileAppPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import OfficialDashboard from './pages/official/OfficialDashboard';
import DistrictAdminDashboard from './pages/admin/DistrictAdminDashboard';
import StateAdminDashboard from './pages/admin/StateAdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

const DASHBOARD_ROUTES = {
  driver: '/driver/dashboard',
  field_official: '/official/dashboard',
  district_admin: '/admin/dashboard',
  state_admin: '/state/dashboard',
};

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen atlas-bg">
        <div className="min-h-screen atlas-veil flex items-center justify-center">
          <div className="text-center">
            <div className="spinner-gold mx-auto" />
            <p className="eyebrow mt-6">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user?.userType)) {
    return <Navigate to={DASHBOARD_ROUTES[user?.userType] || '/'} replace />;
  }

  return children;
};

const AppRoutes = () => (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(13,17,23,0.96)',
          color: '#ede6d6',
          border: '1px solid rgba(201,169,110,0.28)',
          boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
        },
      }}
    />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/map" element={<PublicMapPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/mobile" element={<MobileAppPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/driver/dashboard"
        element={(
          <ProtectedRoute roles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/official/dashboard"
        element={(
          <ProtectedRoute roles={['field_official']}>
            <OfficialDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/dashboard"
        element={(
          <ProtectedRoute roles={['district_admin']}>
            <DistrictAdminDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/state/dashboard"
        element={(
          <ProtectedRoute roles={['state_admin']}>
            <StateAdminDashboard />
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
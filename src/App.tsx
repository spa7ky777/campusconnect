import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProfileSetup from './components/profile/ProfileSetup';
import DiscoverPage from './components/discover/DiscoverPage';
import ChatPage from './components/chat/ChatPage';
import ProfilePage from './components/profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected Routes - Profile Setup (doesn't require complete profile) */}
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Require complete profile */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DiscoverPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
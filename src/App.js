import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles'; // Import all styles centrally

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';

// Import components
import Navbar from './components/Navbar';

// Authentication context (simplified version)
export const AuthContext = React.createContext();

function App() {
  // State to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login function
  const login = () => {
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <Router>
        <div className="App">
          <Navbar isAuthenticated={isAuthenticated} logout={logout} />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <SignupPage />} />
            
            {/* Protected routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

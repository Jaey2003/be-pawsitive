import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navbar.css';

function Navbar({ isAuthenticated, logout }) {
  const location = useLocation();
  
  // Don't show navbar on landing, login and signup pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-logo">
          Be Pawsitive
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            // Links for authenticated users
            <>
              <Link to="/home" className="nav-link">Dashboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/pets" className="nav-link">My Pets</Link>
              <button onClick={logout} className="nav-link logout-button">Logout</button>
            </>
          ) : (
            // Links for non-authenticated users
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/pages/AuthPages.css';
import { AuthContext } from '../App';
import useDocumentTitle from '../hooks/useDocumentTitle';

function LoginPage() {
  // Set title to "Be Pawsitive - Login"
  useDocumentTitle('Login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Get authentication context
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset error message
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // For demo purposes, we'll simulate a successful login
    // In a real app, you would validate credentials with a backend
    console.log('Login attempt with:', { email });
    
    // Call the login function from context to update authentication state
    login();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-icon i');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('bi-eye');
      toggleIcon.classList.add('bi-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('bi-eye-slash');
      toggleIcon.classList.add('bi-eye');
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <Link to="/">
          <img src="/images/bp_logo.png" alt="Be Pawsitive Logo" className="logo" />
        </Link>
        <h1>Be Pawsitive</h1>
        <p>Where caring for pets, meets convenience and rewards!</p>
      </div>
      <div className="right-section">
        <div className="form-box">
          <h2>Welcome Back</h2>
          <p className="form-subtitle">Sign in to continue</p>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon"><i className="bi bi-person"></i></span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or Email"
                required
              />
            </div>
            
            <div className="input-group password-container">
              <span className="input-icon"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <span className="toggle-icon" onClick={togglePasswordVisibility}>
                <i className="bi bi-eye"></i>
              </span>
            </div>
            
            <button type="submit" className="login-btn">Log In</button>
          </form>
          
          <div className="form-footer">
            <a href="#forgot-password">Forgot password?</a>
            <div className="divider">
              <span>OR</span>
            </div>
            <Link to="/signup">
              <button className="create-account-btn">Create new account</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 
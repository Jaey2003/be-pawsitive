import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/pages/AuthPages.css';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { AuthContext } from '../App';

function SignupPage() {
  // Set title to "Be Pawsitive - Sign Up"
  useDocumentTitle('Sign Up');
  
  // Get authentication context
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    termsCheck: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset error message
    setError('');
    
    // Basic validation
    if (!formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.termsCheck) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    // Here you would typically make an API call to register the user
    console.log('Registration attempt with:', { 
      username: formData.username 
    });
    
    // For demo purposes, automatically log the user in after successful signup
    login();
  };

  // Terms and Privacy modals would be implemented with a modal library in a real app
  const showTermsModal = () => {
    alert('Terms of Service would show in a modal here');
  };

  const showPrivacyModal = () => {
    alert('Privacy Policy would show in a modal here');
  };

  return (
    <div className="signup-container">
      <div className="left-section">
        <Link to="/">
          <img src="/images/bp_logo.png" alt="Be Pawsitive Logo" className="logo" />
        </Link>
        <h1>Be Pawsitive</h1>
        <p>Where caring for pets, meets convenience and rewards!</p>
      </div>
      <div className="right-section">
        <div className="form-box">
          <h2>Create Your Account</h2>
          <p className="form-subtitle">Join our community of pet lovers today!</p>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-4">
              <input
                type="text"
                name="username"
                className="form-control"
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <label htmlFor="username">Username</label>
              <div className="form-text">Choose a unique username</div>
            </div>
            
            <div className="form-floating mb-4">
              <input
                type="password"
                name="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="password">Password</label>
              <div className="form-text">Min. 8 characters with letters, numbers & special characters</div>
            </div>
            
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                name="termsCheck"
                id="termsCheck"
                checked={formData.termsCheck}
                onChange={handleChange}
                required
              />
              <label className="form-check-label" htmlFor="termsCheck">
                I agree to the <a href="#" className="terms-link" onClick={showTermsModal}>Terms of Service</a> and <a href="#" className="terms-link" onClick={showPrivacyModal}>Privacy Policy</a>
              </label>
              <div id="termsHelp" className="form-text">You must agree to continue</div>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </form>
          <div className="login-link">
            <hr />
            <Link to="/login">Already have an account? <span>Log In</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage; 
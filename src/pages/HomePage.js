import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Common.css';
import '../styles/pages/HomePage.css';
import useDocumentTitle from '../hooks/useDocumentTitle';

function HomePage() {
  // Set title to "Be Pawsitive - Dashboard"
  useDocumentTitle('Dashboard');
  
  // Mock user data - in a real app, this would come from authentication context or state
  const user = {
    name: "Pet Lover",
    profileImage: "/logo192.png"
  };

  return (
    <div className="home-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Here's what's happening in your pet community today</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card activity-feed">
            <h2>Activity Feed</h2>
            <div className="feed-items">
              <div className="feed-item">
                <div className="feed-avatar"></div>
                <div className="feed-content">
                  <h4>John shared a photo of his new puppy</h4>
                  <p className="feed-time">2 hours ago</p>
                </div>
              </div>
              <div className="feed-item">
                <div className="feed-avatar"></div>
                <div className="feed-content">
                  <h4>Sarah asked about veterinarians in Boston</h4>
                  <p className="feed-time">5 hours ago</p>
                </div>
              </div>
              <div className="feed-item">
                <div className="feed-avatar"></div>
                <div className="feed-content">
                  <h4>Pet Care Tips: Winter Edition was published</h4>
                  <p className="feed-time">Yesterday</p>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary">View More</button>
          </div>

          <div className="dashboard-card quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-button">
                <span className="action-icon">📝</span>
                <span>New Post</span>
              </button>
              <button className="action-button">
                <span className="action-icon">🖼️</span>
                <span>Upload Photo</span>
              </button>
              <button className="action-button">
                <span className="action-icon">👥</span>
                <span>Find Friends</span>
              </button>
              <button className="action-button">
                <span className="action-icon">🔍</span>
                <span>Explore</span>
              </button>
            </div>
          </div>

          <div className="dashboard-card upcoming-events">
            <h2>Upcoming Events</h2>
            <div className="event-list">
              <div className="event-item">
                <div className="event-date">
                  <span className="event-month">JUN</span>
                  <span className="event-day">15</span>
                </div>
                <div className="event-details">
                  <h4>Pet Adoption Day</h4>
                  <p>Central Park, 10:00 AM</p>
                </div>
              </div>
              <div className="event-item">
                <div className="event-date">
                  <span className="event-month">JUN</span>
                  <span className="event-day">22</span>
                </div>
                <div className="event-details">
                  <h4>Dog Training Workshop</h4>
                  <p>Community Center, 2:00 PM</p>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary">View All Events</button>
          </div>

          <div className="dashboard-card pet-tips">
            <h2>Pet Care Tip of the Day</h2>
            <div className="tip-content">
              <p className="tip-text">
                Regular grooming not only keeps your pet looking good but also promotes healthier skin and coat, and allows you to check for any abnormalities.
              </p>
              <button className="btn btn-primary">More Tips</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 
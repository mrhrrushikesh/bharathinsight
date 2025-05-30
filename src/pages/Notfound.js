import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Notfound.css';

/**
 * NotFound component - 404 page when users navigate to non-existent routes
 * Provides a user-friendly message and navigation options back to main site
 */
const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="suggestion-text">
          You might want to check our popular categories:
        </div>
        <div className="category-suggestions">
          {['Trending', 'Tech', 'Finance', 'Movies', 'Business'].map((category) => (
            <Link 
              key={category} 
              to={`/${category.toLowerCase()}`} 
              className="suggested-category"
            >
              {category}
            </Link>
          ))}
        </div>
        <Link to="/" className="home-button">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

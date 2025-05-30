import React from 'react';
import '../styles/SkeletonLoader.css';

/**
 * SkeletonLoader component that mimics the layout of a category section
 * Shows a shimmer animation while content is being loaded
 * @param {string} categoryTitle - The title of the category to display
 */
const SkeletonLoader = ({ categoryTitle }) => {
  return (
    <div className="skeleton-container">
      {/* Top grid with 2 large items */}
      <div className="skeleton-grid">
        <div className="skeleton-grid-item"></div>
        <div className="skeleton-grid-item"></div>
      </div>
      
      {/* Carousel with 4 smaller items */}
      <div className="skeleton-carousel">
        <div className="skeleton-carousel-item"></div>
        <div className="skeleton-carousel-item"></div>
        <div className="skeleton-carousel-item"></div>
        <div className="skeleton-carousel-item"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;

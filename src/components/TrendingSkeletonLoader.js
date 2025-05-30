import React from 'react';
import '../styles/TrendingSkeletonLoader.css';

/**
 * TrendingSkeletonLoader component that mimics the layout of the trending posts
 * Shows a shimmer animation while content is being loaded
 */
const TrendingSkeletonLoader = () => {
  // Create an array of 5 items to simulate the loading of multiple trending posts
  const skeletonItems = Array(5).fill(null);
  
  return (
    <div className="trending-skeleton-container">
      {skeletonItems.map((_, index) => (
        <div key={index} className="trending-skeleton-item">
          <div className="trending-skeleton-image"></div>
          <div className="trending-skeleton-content">
            <div className="trending-skeleton-title"></div>
            <div className="trending-skeleton-excerpt">
              <div className="trending-skeleton-line"></div>
              <div className="trending-skeleton-line"></div>
              <div className="trending-skeleton-line short"></div>
            </div>
            <div className="trending-skeleton-date"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendingSkeletonLoader;

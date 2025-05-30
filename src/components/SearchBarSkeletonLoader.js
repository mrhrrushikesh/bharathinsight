import React from 'react';
import '../styles/SearchBarSkeletonLoader.css';

/**
 * SearchBarSkeletonLoader component that mimics the layout of search results
 * Shows a shimmer animation while search results are loading
 */
const SearchBarSkeletonLoader = () => {
  // Generate multiple skeleton items to represent search results
  return (
    <div className="search-skeleton-container">
      
      {/* Multiple skeleton items for search results */}
      {[...Array(5)].map((_, index) => (
        <div key={index} className="search-skeleton-item">
          <div className="search-skeleton-image"></div>
          <div className="search-skeleton-content">
            <div className="search-skeleton-title"></div>
            <div className="search-skeleton-excerpt"></div>
            <div className="search-skeleton-date"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchBarSkeletonLoader;

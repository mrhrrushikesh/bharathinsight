import React from 'react';
import '../styles/ArticleSkeletonLoader.css';

const ArticleSkeletonLoader = () => {
  return (
    <>
      {/* Dark header area */}
      <div className="article-skeleton-hero">
        <div className="article-skeleton-hero-inner">
          {/* Breadcrumb skeleton */}
          <div className="article-skeleton-breadcrumb"></div>
          
          {/* Title skeleton */}
          <div className="article-skeleton-title"></div>
          
          {/* Meta info skeleton */}
          <div className="article-skeleton-meta">
            <div className="article-skeleton-date"></div>
            <div className="article-skeleton-share"></div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="article-skeleton-body">
        <div className="article-skeleton-body-inner">
          <main className="article-skeleton-main">
            {/* Featured image skeleton */}
            <div className="article-skeleton-image"></div>
            
            {/* Content skeleton */}
            <div className="article-skeleton-content">
              <div className="article-skeleton-paragraph"></div>
              <div className="article-skeleton-paragraph"></div>
              <div className="article-skeleton-paragraph"></div>
              <div className="article-skeleton-paragraph short"></div>
              
              <div className="article-skeleton-paragraph"></div>
              <div className="article-skeleton-paragraph"></div>
              <div className="article-skeleton-paragraph short"></div>
            </div>
            
            {/* Comments section skeleton */}
            <div className="article-skeleton-comments">
              <div className="article-skeleton-comment-header"></div>
              <div className="article-skeleton-comment-form">
                <div className="article-skeleton-input"></div>
                <div className="article-skeleton-input"></div>
                <div className="article-skeleton-textarea"></div>
                <div className="article-skeleton-button"></div>
              </div>
            </div>
            
            {/* More stories section */}
            <div className="article-skeleton-more">
              <div className="article-skeleton-more-header"></div>
              <div className="article-skeleton-more-list">
                {Array(3).fill(null).map((_, idx) => (
                  <div key={`more-item-${idx}`} className="article-skeleton-more-item">
                    <div className="article-skeleton-more-image"></div>
                    <div className="article-skeleton-more-title"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ArticleSkeletonLoader;
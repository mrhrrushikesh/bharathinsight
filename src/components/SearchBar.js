import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchPosts } from '../services/wordpressAPI';
import '../styles/Searchbar.css';
import SearchBarSkeletonLoader from './SearchBarSkeletonLoader';

const SearchBar = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchQuery) return;

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const results = await searchPosts(searchQuery, { _embed: true });
        setSearchResults(results);
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const formatDate = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diff = now - postDate;

    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return postDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getImageUrl = (post) =>
    post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    '/fallback-image.jpg';

  // Helper to get the first category slug or 'unknown'
  const getCategorySlug = (post) => {
    // WordPress embeds terms in _embedded['wp:term']
    const terms = post?._embedded?.['wp:term'];
    if (Array.isArray(terms)) {
      // Find the array for 'category' taxonomy
      const categoryArr = terms.find(
        (arr) => Array.isArray(arr) && arr[0]?.taxonomy === 'category'
      );
      if (Array.isArray(categoryArr) && categoryArr.length > 0) {
        return categoryArr[0].slug || 'unknown';
      }
    }
    return 'unknown';
  };

  // Optionally, if you want to display the category name instead of slug:
  // const getCategoryName = (post) => {
  //   const terms = post?._embedded?.['wp:term'];
  //   if (Array.isArray(terms)) {
  //     const categoryArr = terms.find(
  //       (arr) => Array.isArray(arr) && arr[0]?.taxonomy === 'category'
  //     );
  //     if (Array.isArray(categoryArr) && categoryArr.length > 0) {
  //       return categoryArr[0].name || 'Unknown';
  //     }
  //   }
  //   return 'Unknown';
  // };

  return (
    <div className="search-container">
      <div className="content-wrapper">
        <div className="topics-sidebar">
          <h2>TOPICS ON "{searchQuery.toUpperCase()}"</h2>
          {/* Topic links would go here */}
        </div>

        <div className="search-results-wrapper">
          <div className="results-header">
            <p className="result-count">
              {searchResults.length} Results for "{searchQuery}"
            </p>
            <div className="sort-options">
              <label htmlFor="sort-select">Sort by:</label>
              <select id="sort-select">
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>

          <hr />

          {loading ? (
            <SearchBarSkeletonLoader />
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="search-results-list">
              {searchResults.map((post) => {
                const categorySlug = getCategorySlug(post);
                return (
                  <article key={post.id} className="search-result-item">
                    <Link to={`/${categorySlug}/${post.slug}`} className="result-link">
                      <div className="result-image">
                        <img
                          src={getImageUrl(post)}
                          alt={post.title.rendered}
                          onError={(e) => (e.target.src = '/fallback-image.jpg')}
                        />
                      </div>
                      <div className="result-content">
                        <h3 className="result-title">{post.title.rendered}</h3>
                        <div
                          className="result-excerpt"
                          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                        />
                        <time className="result-date" dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

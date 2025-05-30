import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { getCategoryBySlug, getPostsByCategory } from '../services/wordpressAPI';
import '../styles/CategoryPage.css';
import TrendingSkeletonLoader from '../components/TrendingSkeletonLoader';

const POSTS_PER_PAGE = 10;

const CategoryPage = () => {
  const { category } = useParams();
  const location = useLocation();
  // Extract category from path if not in params
  const pathParts = location.pathname.split('/');
  let categoryFromPath;
  
  // Handle both /category/slug and /slug formats
  if (pathParts[1] === 'category') {
    categoryFromPath = pathParts[2]; // /category/finance -> 'finance'
  } else {
    categoryFromPath = pathParts[1]; // /finance -> 'finance'
  }
  
  const categorySlug = category || categoryFromPath;
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categoryId, setCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [totalPostCount, setTotalPostCount] = useState(0);

  // Helper: get category slug from post
  const getCategorySlug = (post) => {
    // For WordPress.com API v1.1 we need to check different structure
    if (post?.categories) {
      // WordPress.com REST API v1.1 has categories as an object with category slugs as keys
      const categoryKeys = Object.keys(post.categories);
      if (categoryKeys.length > 0) {
        return categoryKeys[0];
      }
    }
    
    // Try embedded terms (old WP API format) as fallback
    const terms = post?._embedded?.['wp:term'];
    if (Array.isArray(terms)) {
      const categoryArr = terms.find(
        (arr) => Array.isArray(arr) && arr[0]?.taxonomy === 'category'
      );
      if (Array.isArray(categoryArr) && categoryArr.length > 0) {
        return categoryArr[0].slug || 'unknown';
      }
    }
    
    // If we reached here, use the current page category
    return categorySlug || 'unknown';
  };

  // Helper: get post image - WordPress.com REST API v1.1 provides featured_image differently
  const getImageUrl = (post) => {
    // Try different possible paths for featured image in WordPress.com API
    if (post?.featured_image) {
      return post.featured_image;
    }
    
    if (post?.featured_media?.uri) {
      return post.featured_media.uri;
    }
    
    if (post?.attachments) {
      // Look through attachments for featured image
      const attachmentIds = Object.keys(post.attachments);
      for (const id of attachmentIds) {
        const attachment = post.attachments[id];
        if (attachment.URL) {
          return attachment.URL;
        }
      }
    }
    
    // Fallback
    return '/fallback-image.jpg';
  };

  // Helper: timezone-safe format date
  const formatDate = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();

    // Convert both dates to UTC
    const postUtc = Date.UTC(
      postDate.getUTCFullYear(),
      postDate.getUTCMonth(),
      postDate.getUTCDate(),
      postDate.getUTCHours(),
      postDate.getUTCMinutes(),
      postDate.getUTCSeconds()
    );
    const nowUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );

    const diffMs = nowUtc - postUtc;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    // Check if postDate and now are on the same UTC day
    const isSameDay =
      postDate.getUTCFullYear() === now.getUTCFullYear() &&
      postDate.getUTCMonth() === now.getUTCMonth() &&
      postDate.getUTCDate() === now.getUTCDate();

    if (isSameDay) {
      if (diffMin < 1) {
        return '1 min ago';
      } else if (diffMin < 60) {
        return `${diffMin} min ago`;
      } else {
        return `${diffHr} hours ago`;
      }
    } else {
      // Format: Jan 1, 2022
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return postDate.toLocaleDateString('en-US', options);
    }
  };

  // Format the category name for display (capitalize first letter of each word)
  const formatCategoryName = (slug) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get custom slogan based on category slug
  const getCategorySlogan = (slug) => {
    const slogans = {
      trending: 'What everyone is talking about right now',
      tech: 'The latest in technology and innovation',
      movies: 'The pulse of Indian cinema and entertainment',
      business: 'Business insights and market trends',
      crypto: 'Navigating the world of cryptocurrency',
      career: 'Career insights and professional growth',
      finance: 'Financial news and market analysis',
      sports: 'Sports coverage and athletic achievements',
      health: 'Wellness tips and health information',
      politics: 'Political developments and governance',
      world: 'Global news and international affairs'
    };
    
    return slogans[slug?.toLowerCase()] || 'Insights that matter';
  };

  // Category data fetching
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      setPosts([]);
      setPage(1);
      
      // For debugging
      console.log('CategoryPage: Fetching category with slug:', categorySlug);
      
      try {
        // Normalize the category slug for WordPress.com (all lowercase, no spaces)
        const normalizedSlug = categorySlug?.toLowerCase().trim() || '';
        
        if (!normalizedSlug) {
          throw new Error('No category specified');
        }
        
        // Complete category mapping for all categories in routes
        const categoryMap = {
          'trending': { ID: 31553, name: 'Trending' },
          'tech': { ID: 31554, name: 'Tech' },
          'movies': { ID: 31555, name: 'Movies' },
          'business': { ID: 31556, name: 'Business' },
          'crypto': { ID: 31557, name: 'Crypto' },
          'career': { ID: 31558, name: 'Career' },
          'finance': { ID: 31559, name: 'Finance' },
          'sports': { ID: 31560, name: 'Sports' },
          'health': { ID: 31561, name: 'Health' },
          'politics': { ID: 31562, name: 'Politics' },
          'world': { ID: 31563, name: 'World' }
        };
        
        // Get category info from our mapping
        let resolvedCategoryInfo = categoryMap[normalizedSlug];
        
        // If not in our mapping, try to look it up from WordPress
        if (!resolvedCategoryInfo) {
          console.log(`Category "${normalizedSlug}" not found in our mapping, looking it up...`);
          try {
            const category = await getCategoryBySlug(normalizedSlug);
            console.log('CategoryPage: Category lookup result:', category);
            
            if (category && (category.ID || category.id)) {
              resolvedCategoryInfo = {
                ID: category.ID || category.id,
                name: category.name || formatCategoryName(normalizedSlug)
              };
            }
          } catch (lookupError) {
            console.error('Error looking up category:', lookupError);
          }
        }
        
        // Set category info for UI display
        if (resolvedCategoryInfo && resolvedCategoryInfo.ID) {
          setCategoryId(resolvedCategoryInfo.ID);
          setCategoryName(resolvedCategoryInfo.name || formatCategoryName(normalizedSlug));
          console.log('CategoryPage: Using category info:', resolvedCategoryInfo);
        } else {
          // Default to using the slug for display if we couldn't resolve the category
          setCategoryName(formatCategoryName(normalizedSlug));
        }
        
        // Multi-stage approach to fetch posts by category
        console.log('CategoryPage: Attempting to fetch posts for', normalizedSlug);
        
        // Stage 1: Try by tag first (most reliable with WordPress.com)
        let result = await getPostsByCategory(normalizedSlug, 1, POSTS_PER_PAGE);
        console.log('CategoryPage: Tag-based fetch result:', result);
        
        // If we got posts, use them
        if (result && result.posts && result.posts.length > 0) {
          console.log(`Found ${result.posts.length} posts by tag for ${normalizedSlug}`);
          setPosts(result.posts);
          setHasMore(result.posts.length === POSTS_PER_PAGE && result.posts.length < result.found);
          setTotalPostCount(result.found || result.posts.length);
          setLoading(false);
          return;
        }
        
        // Stage 2: If we have a category ID, try using that
        if (resolvedCategoryInfo && resolvedCategoryInfo.ID) {
          console.log(`No posts found by tag, trying with category ID ${resolvedCategoryInfo.ID}...`);
          result = await getPostsByCategory(resolvedCategoryInfo.ID, 1, POSTS_PER_PAGE);
          console.log('CategoryPage: ID-based fetch result:', result);
          
          if (result && result.posts && result.posts.length > 0) {
            console.log(`Found ${result.posts.length} posts by category ID for ${normalizedSlug}`);
            setPosts(result.posts);
            setHasMore(result.posts.length === POSTS_PER_PAGE && result.posts.length < result.found);
            setTotalPostCount(result.found || result.posts.length);
            setLoading(false);
            return;
          }
        }
        
        // Stage 3: As a last resort, try one more approach - use a simple fetch without async/await
        console.log('No posts found via our service, trying direct WordPress.com API call...');
        
        // Use fetch with regular Promises (no await)
        const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/bharathinsight6.wordpress.com/posts';
        const fields = 'ID,date,title,content,excerpt,slug,featured_image,attachments,categories,tags,author';
        const fetchUrl = `${apiUrl}?tag=${normalizedSlug}&number=${POSTS_PER_PAGE}&fields=${encodeURIComponent(fields)}`;
        
        console.log('CategoryPage: Direct API fetch URL:', fetchUrl);
        
        fetch(fetchUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Direct API call failed. Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('CategoryPage: Direct API response:', data);
            
            if (data.posts && data.posts.length > 0) {
              console.log(`Found ${data.posts.length} posts via direct API for ${normalizedSlug}`);
              setPosts(data.posts);
              setHasMore(data.posts.length === POSTS_PER_PAGE);
              setTotalPostCount(data.found || data.posts.length);
            } else {
              // If we reach here, we couldn't find any posts with any approach
              console.warn(`No posts found for category ${normalizedSlug} after trying all approaches`);
              setError(`No posts found for ${formatCategoryName(normalizedSlug)}`);
              setPosts([]);
              setTotalPostCount(0);
            }
            setLoading(false);
          })
          .catch(directApiError => {
            console.error('Error with direct API call:', directApiError);
            setError(`Failed to load posts for ${formatCategoryName(normalizedSlug)}`);
            setLoading(false);
          });
      } catch (err) {
        console.error('Error in fetchCategory:', err);
        setError(err.message || 'Failed to load category posts');
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug]);

  // Load more handler
  const handleLoadMore = async () => {
    if (loadMoreLoading) return;
    
    try {
      setLoadMoreLoading(true);
      const nextPage = page + 1;
      console.log(`Loading more posts for ${categorySlug}, page ${nextPage}`);
      
      // Determine the best approach based on what worked for the initial load
      // Try the multi-stage approach to ensure we use the method that worked initially
      
      // Stage 1: Try by tag first (most reliable with WordPress.com)
      const normalizedSlug = categorySlug?.toLowerCase().trim() || '';
      let result = await getPostsByCategory(normalizedSlug, nextPage, POSTS_PER_PAGE);
      console.log('CategoryPage: Load more tag-based result:', result);
      
      // If we got posts, use them
      if (result && result.posts && result.posts.length > 0) {
        console.log(`Found ${result.posts.length} more posts by tag for ${normalizedSlug}`);
        setPosts((prev) => [...prev, ...result.posts]);
        setPage(nextPage);
        setHasMore(result.posts.length === POSTS_PER_PAGE && result.posts.length < result.found);
        setLoadMoreLoading(false);
        return;
      }
      
      // Stage 2: If we have a category ID, try using that
      if (categoryId) {
        console.log(`No more posts found by tag, trying with category ID ${categoryId}...`);
        result = await getPostsByCategory(categoryId, nextPage, POSTS_PER_PAGE);
        console.log('CategoryPage: Load more ID-based result:', result);
        
        if (result && result.posts && result.posts.length > 0) {
          console.log(`Found ${result.posts.length} more posts by category ID for ${normalizedSlug}`);
          setPosts((prev) => [...prev, ...result.posts]);
          setPage(nextPage);
          setHasMore(result.posts.length === POSTS_PER_PAGE && result.posts.length < result.found);
          setLoadMoreLoading(false);
          return;
        }
      }
      
      // Stage 3: As a last resort, try direct WordPress API call with Promises
      console.log('No more posts found via our service, trying direct WordPress.com API call...');
      
      // Use fetch with regular Promises (no await)
      const apiUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/bharathinsight6.wordpress.com/posts';
      const fields = 'ID,date,title,content,excerpt,slug,featured_image,attachments,categories,tags,author';
      const fetchUrl = `${apiUrl}?tag=${normalizedSlug}&number=${POSTS_PER_PAGE}&page=${nextPage}&fields=${encodeURIComponent(fields)}`;
      
      console.log('CategoryPage: Direct API load more URL:', fetchUrl);
      
      fetch(fetchUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Direct API call failed. Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('CategoryPage: Direct API load more response:', data);
          
          if (data.posts && data.posts.length > 0) {
            console.log(`Found ${data.posts.length} more posts via direct API for ${normalizedSlug}`);
            setPosts((prev) => [...prev, ...data.posts]);
            setPage(nextPage);
            setHasMore(data.posts.length === POSTS_PER_PAGE);
          } else {
            // If we reach here, we couldn't find any more posts
            console.warn(`No more posts found for category ${normalizedSlug} after trying all approaches`);
            setHasMore(false);
          }
          setLoadMoreLoading(false);
        })
        .catch(directApiError => {
          console.error('Error with direct API load more call:', directApiError);
          setError('Could not load more posts.');
          setLoadMoreLoading(false);
        });
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('Could not load more posts.');
      setLoadMoreLoading(false);
    }
  };

  const displayName = categoryName || formatCategoryName(categorySlug);

  return (
    <div className="category-page">
      <div className="category-page__content">
        <div className="category-page__header">
          <h1 className="category-page__title">{formatCategoryName(categorySlug)}</h1>
          <p className="category-page__subtitle">{getCategorySlogan(categorySlug)}</p>
        </div>

        <div className="category-page__results">
          <div className="category-page__results-header">
            <p className="category-page__count">
              {totalPostCount} {displayName} Stories
            </p>
          </div>

          <hr className="category-page__divider" />

          {loading ? (
            <TrendingSkeletonLoader />
          ) : error ? (
            <p className="category-page__error">{error}</p>
          ) : (
            <>
              <div className="category-page__list">
                {posts.map((post) => {
                  const categorySlug = getCategorySlug(post);
                  return (
                    <article key={post.ID || post.id} className="category-page__item">
                      <Link to={`/${categorySlug}/${post.slug}`} className="category-page__link">
                        <div className="category-page__image-container">
                          <img
                            src={getImageUrl(post)}
                            alt={typeof post.title === 'object' ? post.title.rendered : post.title || ''}
                            className="category-page__image"
                            onError={(e) => {
                              console.log('Image load error for:', post.title);
                              e.target.src = '/fallback-image.jpg';
                            }}
                          />
                        </div>
                        <div className="category-page__content">
                          <h3 className="category-page__item-title">
                            {/* WordPress.com API might have title as string or object */}
                            {typeof post.title === 'object' ? post.title.rendered : post.title || ''}
                          </h3>
                          <div
                            className="category-page__excerpt"
                            dangerouslySetInnerHTML={{
                              __html: typeof post.excerpt === 'object' 
                                ? post.excerpt.rendered 
                                : post.excerpt || ''
                            }}
                          />
                          <time className="category-page__date" dateTime={post.date}>
                            {formatDate(post.date)}
                          </time>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
              {hasMore && (
                <div className="category-page__loadmore-wrapper">
                  <button
                    className="category-page__loadmore-btn"
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                  >
                    {loadMoreLoading ? (
                      <span className="category-page__spinner"></span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
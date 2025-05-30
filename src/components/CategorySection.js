import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { getPosts, getCategoryBySlug } from "../services/wordpressAPI";
import SkeletonLoader from "./SkeletonLoader";

// Helper functions
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  try {
    const postDate = new Date(dateString);
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date string passed to formatTimeAgo:", dateString);
      return "";
    }
    const now = new Date();
    const secondsPast = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    if (secondsPast < 0) return "just now";
    if (secondsPast < 2) return "1 second ago";
    if (secondsPast < 60) return `${secondsPast} seconds ago`;
    const minutesPast = Math.floor(secondsPast / 60);
    if (minutesPast < 2) return "1 minute ago";
    if (minutesPast < 60) return `${minutesPast} minutes ago`;
    const hoursPast = Math.floor(minutesPast / 60);
    if (hoursPast < 2) return "1 hour ago";
    if (hoursPast < 24) return `${hoursPast} hours ago`;
    const daysPast = Math.floor(hoursPast / 24);
    if (daysPast < 2) return "1 day ago";
    if (daysPast < 7) return `${daysPast} days ago`;
    if (daysPast < 30.44) {
      const weeksPast = Math.floor(daysPast / 7);
      return weeksPast < 2 ? "1 week ago" : `${weeksPast} weeks ago`;
    }
    if (daysPast < 365) {
      const monthsPast = Math.floor(daysPast / 30.44);
      return monthsPast < 2 ? "1 month ago" : `${monthsPast} months ago`;
    }
    const yearsPast = Math.floor(daysPast / 365);
    return yearsPast < 2 ? "1 year ago" : `${yearsPast} years ago`;
  } catch (error) {
    console.error("Error calculating time ago:", error);
    return "";
  }
};

const truncateTitle = (text, limit) => {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.substring(0, limit) + "...";
};

const CategorySection = ({ categorySlug, categoryTitle, loadImmediately = false }) => {
  const POSTS_PER_CATEGORY = 50;
  const postsPerPage = 4;
  const totalPages = (posts) => Math.ceil((posts.length - 2) / postsPerPage);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(loadImmediately);
  const carouselRef = useRef(null);
  const viewportRef = useRef(null);
  const sectionRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // IntersectionObserver setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: "200px 0px", // Start loading 200px before section comes into view
        threshold: 0.1
      }
    );
    
    if (sectionRef.current && !loadImmediately) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current && !loadImmediately) {
        observer.disconnect();
      }
    };
  }, [loadImmediately]);

  // Data fetching
  useEffect(() => {
    async function fetchCategoryPosts() {
      if (!visible || isLoaded) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching posts for category: ${categorySlug}`);
        
        // Special case for Trending category - no need for category filtering
        if (categorySlug.toLowerCase() === "trending") {
          // Get the latest posts without filtering by category
          const fetchedPosts = await getPosts({
            number: POSTS_PER_CATEGORY,
          });
          
          if (fetchedPosts && fetchedPosts.length > 0) {
            console.log("Trending posts fetched successfully:", fetchedPosts.length);
            console.log("Sample post:", fetchedPosts[0]);
            
            setPosts(fetchedPosts);
            setIsLoaded(true);
          } else {
            console.error("No trending posts found");
            throw new Error(`No posts found for Trending`);
          }
        } else {
          // For all other categories, use a combination of approaches to get posts
          // Get normalized slug for consistent handling
          const normalizedSlug = categorySlug.toLowerCase();
          console.log(`Fetching posts for category slug: ${normalizedSlug}`);
          
          // Define our category mapping for ID lookup
          const categoryMap = {
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
          
          // Approach 1: Try using tag first (most reliable with WordPress.com)
          let fetchedPosts = await getPosts({
            tag: normalizedSlug,
            number: POSTS_PER_CATEGORY
          });
          
          // If tag approach worked, use those posts
          if (fetchedPosts && fetchedPosts.length > 0) {
            console.log(`${categorySlug} posts fetched by tag successfully:`, fetchedPosts.length);
            setPosts(fetchedPosts);
            setIsLoaded(true);
            setLoading(false);
            return;
          }
          
          console.log(`No posts found with tag '${normalizedSlug}', trying category...`);
          
          // Approach 2: Try using category slug directly
          fetchedPosts = await getPosts({
            category: normalizedSlug,
            number: POSTS_PER_CATEGORY
          });
          
          // If category slug approach worked, use those posts
          if (fetchedPosts && fetchedPosts.length > 0) {
            console.log(`${categorySlug} posts fetched by category slug successfully:`, fetchedPosts.length);
            setPosts(fetchedPosts);
            setIsLoaded(true);
            setLoading(false);
            return;
          }
          
          console.log(`No posts found with category slug '${normalizedSlug}', trying category ID...`);
          
          // Approach 3: Try using category ID from our mapping
          if (categoryMap[normalizedSlug]) {
            const categoryId = categoryMap[normalizedSlug].ID;
            console.log(`Using hardcoded category ID for ${normalizedSlug}:`, categoryId);
            
            fetchedPosts = await getPosts({
              category: categoryId,
              number: POSTS_PER_CATEGORY
            });
            
            if (fetchedPosts && fetchedPosts.length > 0) {
              console.log(`${categorySlug} posts fetched by category ID successfully:`, fetchedPosts.length);
              setPosts(fetchedPosts);
              setIsLoaded(true);
              setLoading(false);
              return;
            }
          }
          
          // If we get here, try to find the category by slug from WordPress API
          console.log(`Trying to find category information for ${normalizedSlug}...`);
          try {
            const category = await getCategoryBySlug(normalizedSlug);
            if (category && (category.ID || category.id)) {
              const categoryId = category.ID || category.id;
              console.log(`Found category ID ${categoryId} for ${normalizedSlug}, fetching posts...`);
              
              fetchedPosts = await getPosts({
                category: categoryId,
                number: POSTS_PER_CATEGORY
              });
              
              if (fetchedPosts && fetchedPosts.length > 0) {
                console.log(`${categorySlug} posts fetched by resolved category ID successfully:`, fetchedPosts.length);
                setPosts(fetchedPosts);
                setIsLoaded(true);
                setLoading(false);
                return;
              }
            }
          } catch (categoryErr) {
            console.error(`Error finding category for ${normalizedSlug}:`, categoryErr);
          }
          
          // If we reach here, we've tried all approaches and found no posts
          throw new Error(`No posts found for ${categorySlug} after trying multiple approaches`);
        }
      } catch (err) {
        console.error(`Failed to fetch ${categorySlug} posts:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategoryPosts();
  }, [visible, isLoaded, categorySlug, categoryTitle]);

  const topPosts = posts.slice(0, 2);
  const carouselPosts = posts.slice(2);
  const totalCategoryPages = totalPages(posts);

  const moveCarousel = (direction) => {
    let newIndex = carouselIndex;
    if (direction === "next" && carouselIndex < totalCategoryPages - 1) newIndex++;
    else if (direction === "prev" && carouselIndex > 0) newIndex--;
    if (newIndex !== carouselIndex && viewportRef.current) {
      setCarouselIndex(newIndex);
      const viewportWidth = viewportRef.current.clientWidth;
      carouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // Common section header component that displays immediately
  const SectionHeader = () => {
    // Function to get the correct URL path based on category
    const getCategoryPath = () => {
      // Convert category title to slug format for URL
      const slug = categoryTitle.toLowerCase().replace(/\s+/g, '-');
      return `/${slug}`;
    };

    return (
      <div className="trending-header">
        <div className="header-title-wrapper">
          <h2 className="trending-title">{categoryTitle}</h2>
          <Link to={getCategoryPath()} className="view-all-link">
            View All <span className="cross-arrow">↗</span>
          </Link>
        </div>
        <div className="trending-title-line"></div>
      </div>
    );
  };

  // Render loading state if section is visible but still loading
  if (visible && loading) {
    return (
      <section ref={sectionRef} className="trending-container">
        <SectionHeader />
        <div className="skeleton-wrapper">
          <SkeletonLoader categoryTitle={categoryTitle} />
        </div>
      </section>
    );
  }

  // Render error state
  if (visible && error) {
    return (
      <section ref={sectionRef} className="trending-container">
        <SectionHeader />
        <div className="error-message">Error loading {categoryTitle} posts</div>
      </section>
    );
  }

  // Don't render anything if not visible or not enough posts
  if (!visible || posts.length < 2) {
    return <div ref={sectionRef} className="section-placeholder"></div>;
  }

  // Render section content
  return (
    <section ref={sectionRef} className="trending-container">
      <SectionHeader />
      <div className="trending-grid">
        {topPosts.map((post) => {
          // Get image URL - handle both WordPress formats
          const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || post.featured_image;
          // Handle title which could be either a string or an object with rendered property
          const postTitle = typeof post.title === 'string' ? post.title : post.title?.rendered || '';
          const title = truncateTitle(postTitle, 80);
          // Use ID which could be either id or ID from WordPress.com API
          const postId = post.id || post.ID;
          return (
            <div key={postId} className="trending-grid-item-wrapper">
              <Link to={`${categoryTitle}/${post.slug}`} className="trending-item">
                <div className="post-image-container">
                  {imageUrl ? 
                    <img src={imageUrl} alt={postTitle} onError={(e) => e.target.parentNode.innerHTML = '<div class="no-image-placeholder">No Image</div>'} /> 
                    : <div className="no-image-placeholder">No Image</div>
                  }
                  <span className="post-time">{formatTimeAgo(post.postDate || post.date)}</span>
                </div>
                <div className="title-overlay">
                  <h3 dangerouslySetInnerHTML={{ __html: title }} />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      {carouselPosts.length > 0 && (
        <section className="carousel-section-container">
          <div className="carousel-viewport" ref={viewportRef}>
            {carouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
            {carouselIndex > 0 && (
              <button aria-label={`Previous ${categoryTitle} posts`} className="carousel-nav carousel-nav-prev" onClick={() => moveCarousel("prev")} />
            )}
            {carouselIndex < totalCategoryPages - 1 && (
              <button aria-label={`Next ${categoryTitle} posts`} className="carousel-nav carousel-nav-next" onClick={() => moveCarousel("next")} />
            )}
            {carouselIndex < totalCategoryPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
            <div className="posts-carousel" ref={carouselRef}>
              {carouselPosts.map((post) => {
                // Get image URL - handle both WordPress formats
                const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || post.featured_image;
                // Handle title which could be either a string or an object with rendered property
                const postTitle = typeof post.title === 'string' ? post.title : post.title?.rendered || '';
                const title = truncateTitle(postTitle, 80);
                // Use ID which could be either id or ID from WordPress.com API
                const postId = post.id || post.ID;
                return (
                  <Link to={`${categoryTitle}/${post.slug}`} key={postId} className="carousel-post">
                    <div className="post-image-container">
                      {imageUrl ? 
                        <img src={imageUrl} alt={postTitle} onError={(e) => e.target.parentNode.innerHTML = '<div class="no-image-placeholder">No Image</div>'} /> 
                        : <div className="no-image-placeholder">No Image</div>
                      }
                    </div>
                    <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                    <span className="post-time-below">{formatTimeAgo(post.postDate || post.date)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </section>
  );
};

export default CategorySection;

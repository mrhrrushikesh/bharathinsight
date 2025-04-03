import React, { useEffect, useState, useRef } from "react";
import "../styles/home.css";
import { getPosts, getFeaturedMedia } from "../services/wordpressAPI";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const postsPerPage = 4; // Number of posts to show at once in the carousel

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        // Fetch posts with embedded media
        const fetchedPosts = await getPosts({
          _embed: 'true',
          per_page: 12 // 2 for trending + 10 for carousel
        });

        // Process posts with media
        const postsWithMedia = await Promise.all(
          fetchedPosts.map(async (post) => {
            let featuredMediaData = null;
            if (post.featured_media && !post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
              try {
                featuredMediaData = await getFeaturedMedia(post.featured_media);
              } catch (mediaErr) {
                console.error(`Failed to fetch media for post ${post.id}:`, mediaErr);
              }
            }
            return { ...post, featuredMediaData: featuredMediaData };
          })
        );

        setPosts(postsWithMedia);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Handle carousel navigation
  const moveCarousel = (direction) => {
    if (!carouselRef.current) return;
    
    const carouselPosts = posts.slice(2); // Skip the trending posts
    const totalSlides = Math.ceil(carouselPosts.length / postsPerPage);
    
    if (direction === 'next' && carouselIndex < totalSlides - 1) {
      // Add animation class
      carouselRef.current.classList.add('slide-left');
      
      // After animation completes
      setTimeout(() => {
        carouselRef.current.classList.remove('slide-left');
        setCarouselIndex(carouselIndex + 1);
        carouselRef.current.style.transform = `translateX(-${(carouselIndex + 1) * 100}%)`;
      }, 500);
    } 
    else if (direction === 'prev' && carouselIndex > 0) {
      // Add animation class
      carouselRef.current.classList.add('slide-right');
      
      // After animation completes
      setTimeout(() => {
        carouselRef.current.classList.remove('slide-right');
        setCarouselIndex(carouselIndex - 1);
        carouselRef.current.style.transform = `translateX(-${(carouselIndex - 1) * 100}%)`;
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <section className="welcome-section">
          <h1>Welcome to BharathInsight</h1>
          <p>Discover the latest articles and insights.</p>
        </section>
        <div className="loading-message">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <section className="welcome-section">
          <h1>Welcome to BharathInsight</h1>
          <p>Discover the latest articles and insights.</p>
        </section>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Separate trending posts and carousel posts
  const trendingPosts = posts.slice(0, 2);
  const carouselPosts = posts.slice(2);

  return (
    <div className="home-container">
      {/* Welcome Section */}
      <section className="welcome-section">
        <h1>Welcome to BharathInsight</h1>
        <p>Discover the latest articles and insights.</p>
      </section>

      {/* Trending Posts Section */}
      <section className="trending-container">
        <h2 className="trending-title">Trending</h2>
        
        <div className="trending-grid">
          {trendingPosts.map(post => (
            <a 
              href={`/post/${post.slug}`}
              key={post.id} 
              className="trending-item"
            >
              {/* Post Image */}
              {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                <img
                  src={post._embedded['wp:featuredmedia'][0].source_url}
                  alt={post.title.rendered}
                />
              ) : post.featuredMediaData?.source_url ? (
                <img
                  src={post.featuredMediaData.source_url}
                  alt={post.title.rendered}
                />
              ) : (
                <div className="no-image-placeholder">No Image Available</div>
              )}
              
              {/* Title Overlay */}
              <div className="title-overlay">
                <h3 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Carousel Posts Section */}
      <section className="carousel-container">
        {/* Carousel navigation */}
        {carouselIndex > 0 && (
          <div 
            className="carousel-nav carousel-nav-prev" 
            onClick={() => moveCarousel('prev')}
          ></div>
        )}
        
        {carouselIndex < Math.ceil(carouselPosts.length / postsPerPage) - 1 && (
          <div 
            className="carousel-nav carousel-nav-next" 
            onClick={() => moveCarousel('next')}
          ></div>
        )}
        
        {/* Side shading */}
        <div className="carousel-shade-left"></div>
        <div className="carousel-shade-right"></div>
        
        {/* Posts carousel */}
        <div 
          className="posts-carousel" 
          ref={carouselRef}
          style={{ 
            transform: `translateX(-${carouselIndex * 100}%)`,
            gridTemplateColumns: `repeat(${carouselPosts.length}, minmax(0, 1fr))`
          }}
        >
          {carouselPosts.map(post => (
            <a 
              href={`/post/${post.slug}`}
              key={post.id} 
              className="carousel-post"
            >
              {/* Post Image */}
              {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                <img
                  src={post._embedded['wp:featuredmedia'][0].source_url}
                  alt={post.title.rendered}
                />
              ) : post.featuredMediaData?.source_url ? (
                <img
                  src={post.featuredMediaData.source_url}
                  alt={post.title.rendered}
                />
              ) : (
                <div className="no-image-placeholder">No Image</div>
              )}
              
              {/* Title */}
              <h3 
                className="post-title"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

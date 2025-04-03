import React, { useEffect, useState, useRef } from "react";
import "../styles/home.css";
import { getPosts, getFeaturedMedia } from "../services/wordpressAPI";
import { formatTimeAgo } from "../utils/formatTime"; // Adjust path if needed

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0); // Index of the *page*
  const carouselRef = useRef(null);
  const postsPerPage = 4; // Always calculate logic based on 4 per page for desktop

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        // Fetch more posts if needed for a long carousel
        const fetchedPosts = await getPosts({
          _embed: 'true',
          per_page: 20 // Fetch more posts for a longer carousel example (2 trending + 18 carousel)
        });

        // Simplified media fetching - _embed should handle most cases
        // Keep your Promise.all logic if _embed is unreliable for your setup
        const postsWithMedia = fetchedPosts.map(post => ({
             ...post,
             // Ensure date is available, prioritize 'date_gmt' or 'date'
             postDate: post.date_gmt || post.date
        }));

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

  // Separate posts *after* loading and error checks
  const trendingPosts = posts.slice(0, 2);
  const carouselPosts = posts.slice(2);

  // Calculate total pages for the carousel
  const totalCarouselPages = Math.ceil(carouselPosts.length / postsPerPage);

  // Handle carousel navigation
  const moveCarousel = (direction) => {
    let newIndex = carouselIndex;
    if (direction === 'next' && carouselIndex < totalCarouselPages - 1) {
      newIndex = carouselIndex + 1;
    } else if (direction === 'prev' && carouselIndex > 0) {
      newIndex = carouselIndex - 1;
    }

    if (newIndex !== carouselIndex && carouselRef.current) {
       setCarouselIndex(newIndex);
       // Slide by 100% of the container width per page
       carouselRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="home-container">
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

  // --- Render Component ---
  return (
    <div className="home-container">

      {/* Trending Posts Section */}
      <section className="trending-container">
        <h2 className="trending-title">Trending</h2>
        <div className="trending-grid">
          {trendingPosts.map(post => {
            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            return (
              <a href={`/post/${post.slug}`} key={post.id} className="trending-item">
                {/* Image Container */}
                <div className="post-image-container">
                  {imageUrl ? (
                    <img src={imageUrl} alt={post.title.rendered} />
                  ) : (
                    <div className="no-image-placeholder">No Image Available</div>
                  )}
                </div>
                 {/* Time Display */}
                 <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                {/* Title Overlay */}
                <div className="title-overlay">
                  <h3 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Carousel Posts Section */}
      {carouselPosts.length > 0 && (
        <section className="carousel-section-container"> {/* Added a wrapper */}
           <h2 className="carousel-title">More Insights</h2> {/* Optional Title */}
           <div className="carousel-viewport"> {/* Viewport for overflow */}

            {/* Carousel navigation - Adjusted visibility check */}
            {carouselIndex > 0 && (
              <button // Use button for accessibility
                aria-label="Previous posts"
                className="carousel-nav carousel-nav-prev"
                onClick={() => moveCarousel('prev')}
              ></button>
            )}

            {carouselIndex < totalCarouselPages - 1 && (
              <button // Use button for accessibility
                aria-label="Next posts"
                className="carousel-nav carousel-nav-next"
                onClick={() => moveCarousel('next')}
              ></button>
            )}

            {/* Posts Carousel */}
            <div
              className="posts-carousel"
              ref={carouselRef}
              // Inline style for transform is now handled in moveCarousel
              // The width calculation is handled by CSS grid properties
            >
              {carouselPosts.map(post => {
                const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                return (
                  <a href={`/post/${post.slug}`} key={post.id} className="carousel-post">
                    {/* Image Container */}
                    <div className="post-image-container">
                      {imageUrl ? (
                        <img src={imageUrl} alt={post.title.rendered} />
                      ) : (
                        <div className="no-image-placeholder">No Image</div>
                      )}
                       {/* Time Display */}
                       <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    {/* Title Below Image */}
                    <h3
                      className="post-title-below" // New class for styling
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                  </a>
                );
              })}
            </div>
           </div> {/* End carousel-viewport */}
           {/* Removed Side Shading - can be added back if needed */}
        </section>
      )}
    </div>
  );
};

export default Home;
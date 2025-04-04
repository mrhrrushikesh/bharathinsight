import React, { useEffect, useState, useRef } from "react";
import "../styles/home.css"; // Assuming your CSS file path is correct
import { getPosts, getCategoryBySlug } from "../services/wordpressAPI"; // Import the necessary functions

/**
 * Calculates the time elapsed since a given date string and returns a
 * formatted "time ago" string (e.g., "5 minutes ago", "1 day ago").
 * Handles seconds, minutes, hours, days, weeks, months, and years.
 *
 * @param {string | null | undefined} dateString - The date string from the API (ideally ISO 8601 format).
 * @returns {string} Formatted time ago string, or empty string if input is invalid.
 */
const formatTimeAgo = (dateString) => {
  if (!dateString) {
    return '';
  }

  try {
    const postDate = new Date(dateString);
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date string passed to formatTimeAgo:", dateString);
      return '';
    }

    const now = new Date();
    const secondsPast = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (secondsPast < 0) return 'just now';
    if (secondsPast < 2) return '1 second ago';
    if (secondsPast < 60) return `${secondsPast} seconds ago`;

    const minutesPast = Math.floor(secondsPast / 60);
    if (minutesPast < 2) return '1 minute ago';
    if (minutesPast < 60) return `${minutesPast} minutes ago`;

    const hoursPast = Math.floor(minutesPast / 60);
    if (hoursPast < 2) return '1 hour ago';
    if (hoursPast < 24) return `${hoursPast} hours ago`;

    const daysPast = Math.floor(hoursPast / 24);
    if (daysPast < 2) return '1 day ago';
    if (daysPast < 7) return `${daysPast} days ago`;

    if (daysPast < 30.44) { // Average days in a month
      const weeksPast = Math.floor(daysPast / 7);
      return weeksPast < 2 ? '1 week ago' : `${weeksPast} weeks ago`;
    }

    if (daysPast < 365) {
      const monthsPast = Math.floor(daysPast / 30.44);
      return monthsPast < 2 ? '1 month ago' : `${monthsPast} months ago`;
    }

    const yearsPast = Math.floor(daysPast / 365);
    return yearsPast < 2 ? '1 year ago' : `${yearsPast} years ago`;

  } catch (error) {
    console.error("Error calculating time ago:", error);
    return '';
  }
};

/**
 * Truncates a string to a specified length and appends '...'.
 * Handles potential HTML entities by decoding before truncating (optional but safer).
 * @param {string} text - The string to truncate.
 * @param {number} limit - The maximum number of characters allowed.
 * @returns {string} The truncated string or the original string if within the limit.
 */
const truncateTitle = (text, limit) => {
  // Basic check
  if (!text) {
    return '';
  }
  // If the text is shorter than or equal to the limit, return it as is.
  if (text.length <= limit) {
    return text;
  }
  // Otherwise, truncate and add ellipsis.
  return text.substring(0, limit) + "...";
};

const Home = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(null);
  const [techPosts, setTechPosts] = useState([]);
  const [techLoading, setTechLoading] = useState(true);
  const [techError, setTechError] = useState(null);
  const trendingCarouselRef = useRef(null);
  const techCarouselRef = useRef(null);
  const [trendingCarouselIndex, setTrendingCarouselIndex] = useState(0);
  const [techCarouselIndex, setTechCarouselIndex] = useState(0);
  const postsPerPage = 4; // Number of posts visible in the carousel at once

  useEffect(() => {
    async function fetchTrendingPosts() {
      try {
        setTrendingLoading(true);
        setTrendingError(null);

        // Fetch the category ID by slug
        const category = await getCategoryBySlug('Trending');
        if (!category) {
          throw new Error("Category 'Trending' not found");
        }

        // Fetch posts with the category ID
        const fetchedPosts = await getPosts({ _embed: 'true', per_page: 6, categories: category.id });

        // Use date_gmt for consistency or fallback to date
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));

        setTrendingPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch trending posts:", err);
        setTrendingError(err);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrendingPosts();
  }, []);

  useEffect(() => {
    async function fetchTechPosts() {
      try {
        setTechLoading(true);
        setTechError(null);

        // Fetch the category ID by slug
        const category = await getCategoryBySlug('tech');
        if (!category) {
          throw new Error("Category 'tech' not found");
        }

        // Fetch posts with the category ID
        const fetchedPosts = await getPosts({ _embed: 'true', per_page: 6, categories: category.id });

        // Use date_gmt for consistency or fallback to date
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));

        setTechPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch tech posts:", err);
        setTechError(err);
      } finally {
        setTechLoading(false);
      }
    }
    fetchTechPosts();
  }, []);

  // Separate posts for trending
  const trendingTopPosts = trendingPosts.slice(0, 2);
  const trendingCarouselPosts = trendingPosts.slice(2);
  const totalTrendingCarouselPages = Math.ceil(trendingCarouselPosts.length / postsPerPage);

  const moveTrendingCarousel = (direction) => {
    let newIndex = trendingCarouselIndex;
    if (direction === 'next' && trendingCarouselIndex < totalTrendingCarouselPages - 1) {
      newIndex++;
    } else if (direction === 'prev' && trendingCarouselIndex > 0) {
      newIndex--;
    }

    if (newIndex !== trendingCarouselIndex && trendingCarouselRef.current) {
      setTrendingCarouselIndex(newIndex);
      const translatePercentage = -((newIndex * postsPerPage) / trendingCarouselPosts.length * 100);
      trendingCarouselRef.current.style.transform = `translateX(${translatePercentage}%)`;
    }
  };

  // Separate posts for tech
  const techTopPosts = techPosts.slice(0, 2);
  const techCarouselPosts = techPosts.slice(2);
  const totalTechCarouselPages = Math.ceil(techCarouselPosts.length / postsPerPage);

  const moveTechCarousel = (direction) => {
    let newIndex = techCarouselIndex;
    if (direction === 'next' && techCarouselIndex < totalTechCarouselPages - 1) {
      newIndex++;
    } else if (direction === 'prev' && techCarouselIndex > 0) {
      newIndex--;
    }

    if (newIndex !== techCarouselIndex && techCarouselRef.current) {
      setTechCarouselIndex(newIndex);
      const translatePercentage = -((newIndex * postsPerPage) / techCarouselPosts.length * 100);
      techCarouselRef.current.style.transform = `translateX(${translatePercentage}%)`;
    }
  };

  // Conditional rendering for loading and error states
  if (trendingLoading || techLoading) {
    return <div className="loading-message">Loading posts...</div>;
  }
  if (trendingError || techError) {
    return <div className="error-message">Could not load posts. Please try again later.</div>;
  }
  if (trendingPosts.length < 2 && techPosts.length < 2 && trendingCarouselPosts.length < 4 && techCarouselPosts.length < 4) {
    return <div className="loading-message">No posts found.</div>;
  }

  return (
    <div className="home-container">
      {/* Trending Section */}
      {trendingPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Trending</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {trendingTopPosts.map((post) => {
              const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <a href={`/post/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? (
                        <img src={imageUrl} alt={post.title.rendered} />
                      ) : (
                        <div className="no-image-placeholder">No Image</div>
                      )}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Trending Carousel Section */}
          {trendingCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport">
                {/* Left Shading */}
                {trendingCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}

                {/* Prev Arrow */}
                {trendingCarouselIndex > 0 && (
                  <button
                    aria-label="Previous trending posts"
                    className="carousel-nav carousel-nav-prev"
                    onClick={() => moveTrendingCarousel('prev')}
                  />
                )}

                {/* Next Arrow */}
                {trendingCarouselIndex < totalTrendingCarouselPages - 1 && (
                  <button
                    aria-label="Next trending posts"
                    className="carousel-nav carousel-nav-next"
                    onClick={() => moveTrendingCarousel('next')}
                  />
                )}

                {/* Right Shading */}
                {trendingCarouselIndex < totalTrendingCarouselPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}

                {/* Carousel items container */}
                <div className="posts-carousel" ref={trendingCarouselRef}>
                  {trendingCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <a href={`/post/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? (
                            <img src={imageUrl} alt={post.title.rendered} />
                          ) : (
                            <div className="no-image-placeholder">No Image</div>
                          )}
                        </div>
                        <h3
                          className="post-title-below"
                          dangerouslySetInnerHTML={{ __html: title }}
                        />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* Tech Section */}
      {techPosts.length >= 2 && (
        <section className="trending-container tech-container">
          <div className="trending-header">
            <h2 className="trending-title">Tech</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {techTopPosts.map((post) => {
              const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <a href={`/post/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? (
                        <img src={imageUrl} alt={post.title.rendered} />
                      ) : (
                        <div className="no-image-placeholder">No Image</div>
                      )}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Tech Carousel Section */}
          {techCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport">
                {/* Left Shading */}
                {techCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}

                {/* Prev Arrow */}
                {techCarouselIndex > 0 && (
                  <button
                    aria-label="Previous tech posts"
                    className="carousel-nav carousel-nav-prev"
                    onClick={() => moveTechCarousel('prev')}
                  />
                )}

                {/* Next Arrow */}
                {techCarouselIndex < totalTechCarouselPages - 1 && (
                  <button
                    aria-label="Next tech posts"
                    className="carousel-nav carousel-nav-next"
                    onClick={() => moveTechCarousel('next')}
                  />
                )}

                {/* Right Shading */}
                {techCarouselIndex < totalTechCarouselPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}

                {/* Carousel items container */}
                <div className="posts-carousel" ref={techCarouselRef}>
                  {techCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <a href={`/post/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? (
                            <img src={imageUrl} alt={post.title.rendered} />
                          ) : (
                            <div className="no-image-placeholder">No Image</div>
                          )}
                        </div>
                        <h3
                          className="post-title-below"
                          dangerouslySetInnerHTML={{ __html: title }}
                        />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
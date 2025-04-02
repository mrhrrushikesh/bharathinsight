import React, { useEffect, useState } from "react";
import "../styles/home.css"; // Make sure this path is correct
import { getPosts, getFeaturedMedia } from "../services/wordpressAPI"; // Make sure this path is correct

const Home = () => {
  // State variables moved directly into the Home component
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook moved directly into the Home component
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch attempt

        // Fetch posts with embedded featured image and author data
        // Using _embed=true is generally preferred as it reduces API calls.
        const fetchedPosts = await getPosts({
          _embed: 'true', // Request embedded data (author, featured media, etc.)
          per_page: 10    // Fetch 10 posts
        });

        // --- Optional: Refined Media Handling ---
        // If getPosts with _embed=true correctly returns embedded media,
        // you might not need the separate getFeaturedMedia calls for each post.
        // The code below keeps the explicit media fetching logic from your original example,
        // but adds better error handling per post and checks if media data is needed.

        const postsWithMedia = await Promise.all(
          fetchedPosts.map(async (post) => {
            let featuredMediaData = null;
            // Check if a featured media ID exists (is not 0) AND if embedded data isn't already present
            if (post.featured_media && !post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
              try {
                // Fetch detailed media data only if necessary
                featuredMediaData = await getFeaturedMedia(post.featured_media);
              } catch (mediaErr) {
                console.error(`Failed to fetch media for post ${post.id}:`, mediaErr);
                // Keep going even if one media fetch fails, just won't have media for this post
              }
            }
            // Return the post, potentially adding the fetched media data
            // Use a distinct key like 'featuredMediaData' to avoid confusion with 'featured_media' (which is the ID)
            return { ...post, featuredMediaData: featuredMediaData };
          })
        );

        // Update state with the processed posts
        setPosts(postsWithMedia);

      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false); // Ensure loading is set to false in both success and error cases
      }
    }

    fetchPosts();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  // Render the component JSX
  return (
    <div className="home-container">

      {/* Welcome Section */}
      <section className="welcome-section">
        <h1>Welcome to BharathInsight</h1>
        {/* You can add more introductory text here if needed */}
        <p>Discover the latest articles and insights.</p>
      </section>

      {/* Posts Section - Added for displaying fetched data */}
      <section className="posts-section">
        <h2>Latest Posts</h2>
        {loading && <p>Loading posts...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && (
          <div className="posts-list">
            {posts.length > 0 ? (
              posts.map(post => (
                <article key={post.id} className="post-item">
                  {/* Display Featured Image - Prioritize embedded, fallback to fetched */}
                  {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                     <img
                       src={post._embedded['wp:featuredmedia'][0].source_url}
                       alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                       className="post-featured-image"
                     />
                  ) : post.featuredMediaData?.source_url ? (
                     <img
                       src={post.featuredMediaData.source_url}
                       alt={post.featuredMediaData.alt_text || post.title.rendered}
                       className="post-featured-image"
                     />
                  ) : (
                    <div className="post-no-image">No Image Available</div>
                  )}

                  {/* Display Title - Use dangerouslySetInnerHTML for potential HTML entities */}
                  <h3 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

                  {/* Display Author - Use embedded data if available */}
                   {post._embedded?.author?.[0]?.name && (
                     <p className="post-author">By: {post._embedded.author[0].name}</p>
                   )}

                   {/* Display Excerpt - Use dangerouslySetInnerHTML */}
                   {post.excerpt?.rendered && (
                     <div className="post-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                   )}

                  {/* Optionally, add a link to the full post */}
                  {/* <a href={post.link} target="_blank" rel="noopener noreferrer">Read More</a> */}
                </article>
              ))
            ) : (
              <p>No posts found.</p> // Message when posts array is empty
            )}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home; // Export the corrected Home component
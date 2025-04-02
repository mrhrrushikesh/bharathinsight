// wordpressapi.js - Functions to interact with WordPress API

// Set your WordPress API URL here
const API_URL = 'http://bharathinsight.local/wp-json/wp/v2';

/**
 * Fetches posts from the WordPress API
 * @param {Object} params - Query parameters to filter posts
 * @returns {Promise<Array>} - Array of post objects
 */
export async function getPosts(params = {}) {
  try {
    // Build query string from params
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `${API_URL}/posts${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }
    
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}
export async function getFeaturedMedia(mediaId) {
    try {
      const response = await fetch(`${API_URL}/media/${mediaId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }
      
      const media = await response.json();
      return media;
    } catch (error) {
      console.error(`Error fetching media with ID ${mediaId}:`, error);
      return null;
    }
  }
export default {
    getPosts,
    getFeaturedMedia
  };

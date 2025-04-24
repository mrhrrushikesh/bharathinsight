const API_URL = process.env.REACT_APP_WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json/wp/v2';

/**
 * Fetches posts from the WordPress API
 */
export async function getPosts(params = {}) {
  try {
    // Ensure _embed is included for media and related data
    const queryParams = { ...params, _embed: true };
    
    const queryString = Object.keys(queryParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join('&');

    const url = `${API_URL}/posts?${queryString}`;
    console.log("Fetching posts from:", url);
    
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

/**
 * Fetches categories from the WordPress API filtered by slug
 */
export async function getCategoryBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/categories?slug=${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
    }
    
    const categories = await response.json();
    return categories[0] || null;
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetches a single post by slug from the WordPress API
 */
export async function getPostBySlug(slug) {
  try {
    const url = `${API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`;
    console.log("Fetching post from:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Post not found');
    }
    
    return data[0];
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    throw error;
  }
}

export default {
  getPosts,
  getCategoryBySlug,
  getPostBySlug
};
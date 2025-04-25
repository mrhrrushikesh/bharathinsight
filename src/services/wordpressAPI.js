const API_URL = process.env.REACT_APP_WORDPRESS_API_URL || 'http://bharathinsight.local/wp-json/wp/v2';

/**
 * Fetches posts from the WordPress API
 */
export async function getPosts(params = {}) {
  try {
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
    const response = await fetch(`${API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`);
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Post not found');
    }
    return data[0];
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    throw error;
  }
}
const wordpressAPI = {
  getPosts,
  getCategoryBySlug,
  getPostBySlug
};

export default wordpressAPI;

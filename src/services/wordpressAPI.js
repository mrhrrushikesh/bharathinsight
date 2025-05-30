// Remove trailing slash if present to avoid double slashes in URL construction
const API_URL = process.env.REACT_APP_WORDPRESS_API_URL.endsWith('/') 
  ? process.env.REACT_APP_WORDPRESS_API_URL.slice(0, -1) 
  : process.env.REACT_APP_WORDPRESS_API_URL;

/**
 * Builds a query string from an object of params
 */
function buildQuery(params = {}) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * Fetches posts from the WordPress.com REST API and formats them to be compatible with the app's components
 */
export async function getPosts(params = {}) {
  try {
    console.log('getPosts called with params:', params);
    
    // Build query string and construct URL
    // For WordPress.com we need to ensure we get enough posts and proper content
    const queryParams = {
      number: params.per_page || 10,
      page: params.page || 1,
    };
    
    // Add fields parameter to ensure we get complete post data including images
    queryParams.fields = 'ID,date,title,content,excerpt,slug,featured_image,attachments,categories,tags,author';
    
    // Handle special WordPress.com API parameters
    // Convert WordPress standard parameters to WordPress.com format
    if (params.per_page) {
      queryParams.number = params.per_page;
    }
    
    // Handle category parameter specially for WordPress.com
    if (params.category) {
      queryParams.category = params.category;
      console.log('Filtering by category:', params.category);
    }
    
    // Handle tag parameter specially for WordPress.com
    if (params.tag) {
      queryParams.tag = params.tag;
      console.log('Filtering by tag:', params.tag);
    }
    
    // Copy any other parameters that aren't specially handled
    Object.keys(params).forEach(key => {
      if (!['per_page', 'category', 'tag', '_embed'].includes(key)) {
        queryParams[key] = params[key];
      }
    });
    
    // Build the full URL with query parameters
    const qs = buildQuery(queryParams);
    const url = `${API_URL}/posts${qs ? `?${qs}` : ''}`;
    console.log('Fetching posts from URL:', url);
    
    // Fetch posts
    const res = await fetch(url);
    console.log('Posts API response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
    }
    
    // Parse the response
    const response = await res.json();
    console.log('WordPress.com API response:', response);
    
    // Check if we got any posts
    if (!response.posts || response.posts.length === 0) {
      console.warn('No posts found in API response for params:', params);
      
      // If we're filtering by category ID but got no results, try with the category name as a tag
      if (params.category && !params.tag && !isNaN(params.category)) {
        // Get the category map from the CategorySection component
        const categoryMap = {
          '31554': 'tech',
          '31555': 'movies',
          '31556': 'business',
          '31557': 'crypto',
          '31558': 'career',
          '31559': 'finance',
          '31560': 'sports',
          '31561': 'health',
          '31562': 'politics',
          '31563': 'world'
        };
        
        const categorySlug = categoryMap[params.category];
        if (categorySlug) {
          console.log(`No posts found for category ID ${params.category}, trying with tag ${categorySlug}...`);
          // Recursive call with tag instead of category
          return getPosts({ ...params, category: undefined, tag: categorySlug });
        }
      }
      
      return [];
    }
    
    // WordPress.com REST API v1.1 has a different structure
    // Posts are in response.posts, not directly in the response
    const wpPosts = response.posts || [];
    
    // Transform WordPress.com API response to match the format expected by components
    const formattedPosts = wpPosts.map(post => {
      // Get featured image from multiple possible sources
      let featuredImage = post.featured_image || null;
      
      // If no featured_image directly, try to extract from attachments
      if (!featuredImage && post.attachments) {
        const attachmentIds = Object.keys(post.attachments);
        for (const id of attachmentIds) {
          if (post.attachments[id].URL) {
            featuredImage = post.attachments[id].URL;
            break;
          }
        }
      }
      
      // If still no image, try to extract first image from content
      if (!featuredImage && post.content) {
        const imgMatch = post.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          featuredImage = imgMatch[1];
        }
      }
      
      // Format the post to match what components expect
      return {
        id: post.ID,
        slug: post.slug,
        date: post.date,
        postDate: post.date, // Added for compatibility with formatTimeAgo
        title: {
          rendered: post.title || ''
        },
        excerpt: {
          rendered: post.excerpt || ''
        },
        content: {
          rendered: post.content || ''
        },
        // Add _embedded for compatibility with components expecting WordPress format
        _embedded: {
          'wp:featuredmedia': featuredImage ? [
            {
              source_url: featuredImage
            }
          ] : []
        },
        // Also add featured_image directly for newer components
        featured_image: featuredImage,
        // Add additional data from WordPress.com API that might be useful
        categories: post.categories || {},
        tags: post.tags || {},
        author: post.author || {}
      };
    });
    
    // Log for debugging
    if (formattedPosts.length > 0) {
      console.log('First formatted post:', formattedPosts[0]);
      console.log(`Found ${formattedPosts.length} posts for the request`);
    } else {
      console.warn('No posts found in API response');
    }
    
    return formattedPosts;
  } catch (err) {
    console.error('Error fetching posts:', err);
    return [];
  }
}

/**
 * Fetches categories from the WordPress.com REST API filtered by slug
 */
export async function getCategoryBySlug(slug) {
  try {
    // WordPress.com REST API v1.1 doesn't have a direct endpoint for slug lookup
    // We need to get all categories and filter
    const url = `${API_URL}categories`;
    console.log('Fetching categories from URL:', url, 'looking for slug:', slug);
    
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Category API error response:', errorText);
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log('Categories response:', response);
    
    // Find the category with the matching slug (case insensitive)
    const categories = response.categories || [];
    const category = categories.find(cat => 
      cat.slug.toLowerCase() === slug.toLowerCase()
    );
    
    if (category) {
      console.log('Found category:', category);
      return category;
    } else {
      console.log('Category not found with slug:', slug);
      // For specific common categories, we'll hardcode IDs if the API doesn't return them
      const defaultCategories = {
        'trending': { ID: 31553, name: 'Trending' },
        'tech': { ID: 31554, name: 'Tech' },
        'movies': { ID: 31555, name: 'Movies' },
        'business': { ID: 31556, name: 'Business' },
        'crypto': { ID: 31557, name: 'Crypto' },
        'career': { ID: 31558, name: 'Career' }
      };
      
      const defaultCategory = defaultCategories[slug.toLowerCase()];
      if (defaultCategory) {
        console.log('Using default category mapping:', defaultCategory);
        return defaultCategory;
      }
      
      return null;
    }
  } catch (err) {
    console.error(`Error fetching category ${slug}:`, err);
    return null;
  }
}

/**
 * Fetches a single post by slug from the WordPress.com REST API
 */
export async function getPostBySlug(slug) {
  try {
    if (!slug) {
      throw new Error('No slug provided to getPostBySlug');
    }
    
    console.log('getPostBySlug called for slug:', slug);
    
    // WordPress.com REST API has a specific endpoint for fetching by slug
    const url = `${API_URL}/posts/slug:${encodeURIComponent(slug)}`;
    console.log('Fetching post by slug from URL:', url);
    
    // Use fetch API consistently
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Post slug API error response:', errorText);
      throw new Error(`Failed to fetch post by slug: ${res.status} ${res.statusText}`);
    }
    
    // WordPress.com REST API returns the post directly, not in an array
    const post = await res.json();
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    console.log('Post details fetched:', post);
    
    // Get featured image from multiple possible sources
    let featuredImage = post.featured_image || null;
    
    // If no featured_image directly, try to extract from attachments
    if (!featuredImage && post.attachments) {
      const attachmentIds = Object.keys(post.attachments);
      for (const id of attachmentIds) {
        if (post.attachments[id].URL) {
          featuredImage = post.attachments[id].URL;
          break;
        }
      }
    }
    
    // If still no image, try to extract first image from content
    if (!featuredImage && post.content) {
      const imgMatch = post.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
      if (imgMatch && imgMatch[1]) {
        featuredImage = imgMatch[1];
      }
    }
    
    // Format the post to match what components expect
    return {
      id: post.ID,
      slug: post.slug,
      date: post.date,
      postDate: post.date,
      title: { rendered: post.title || '' },
      content: { rendered: post.content || '' },
      excerpt: { rendered: post.excerpt || '' },
      featured_image: featuredImage,
      _embedded: {
        'wp:featuredmedia': featuredImage ? [{ source_url: featuredImage }] : []
      },
      categories: post.categories || {},
      tags: post.tags || {},
      author: post.author || {}
    };
  } catch (err) {
    console.error(`Error fetching post by slug ${slug}:`, err);
    throw err;
  }
}

/**
 * Fetches comments for a given post ID
 * Combines remote comments from WordPress API with local comments from localStorage
 */
export async function getCommentsByPost(postId, params = {}) {
  try {
    console.log(`Fetching comments for post ID: ${postId}`);
    
    // 1. Get remote comments from WordPress API
    let remoteComments = [];
    try {
      // WordPress.com REST API v1.1 comments endpoint structure
      const url = `${API_URL}posts/${postId}/replies`;
      console.log('Fetching remote comments from URL:', url);
      
      const res = await fetch(url);
      
      if (res.ok) {
        const response = await res.json();
        console.log('WordPress API comments response:', response);
        remoteComments = response.comments || [];
        
        // Process remote comments
        remoteComments = remoteComments.map(comment => ({
          ...comment,
          // Format date for display (remove time component)
          date: comment.date.split('T')[0],
          remote: true // Mark as remote comment
        }));
      } else {
        console.warn(`Failed to fetch remote comments: ${res.status} ${res.statusText}`);
      }
    } catch (apiError) {
      console.error('Error fetching remote comments:', apiError);
      // Continue with local comments even if remote fetch fails
    }
    
    // 2. Get local comments from localStorage
    const localComments = getLocalCommentsForPost(postId);
    console.log(`Found ${localComments.length} local comments for post ${postId}`);
    
    // 3. Combine both comment sources
    const allComments = [...remoteComments, ...localComments];
    
    // 4. Sort by date (newest first)
    allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`Returning ${allComments.length} total comments for post ${postId}`);
    return allComments;
  } catch (err) {
    console.error(`Error in getCommentsByPost for post ${postId}:`, err);
    return [];
  }
}

/**
 * Retrieves locally stored comments for a specific post
 */
function getLocalCommentsForPost(postId) {
  try {
    // Get all comments from localStorage
    const commentsJson = localStorage.getItem('bharathinsight_comments') || '[]';
    const allLocalComments = JSON.parse(commentsJson);
    
    // Filter comments for this specific post
    return allLocalComments.filter(comment => 
      comment.post_id === postId || // Exact match
      String(comment.post_id) === String(postId) // String comparison as fallback
    );
  } catch (error) {
    console.error('Error retrieving comments from localStorage:', error);
    return [];
  }
}

/**
 * Attempts to submit a comment to WordPress.com and falls back to local storage if that fails
 * This works when the WordPress site has unanonymous comments enabled
 */
export async function createComment(commentData) {
  try {
    console.log('createComment called with data:', commentData);
    
    // First, try to submit the comment directly to WordPress.com
    // This might work if the site has unanonymous comments enabled
    try {
      console.log('Attempting to submit comment to WordPress API...');
      
      // Get the site domain and post ID
      const siteDomain = API_URL.split('/sites/')[1]?.replace(/\/$/, '');
      const postId = commentData.post_ID || commentData.post;
      
      if (!siteDomain || !postId) {
        throw new Error('Missing site domain or post ID');
      }
      
      // Create a submission URL for the WordPress.com REST API
      const commentUrl = `${API_URL}posts/${postId}/replies/new`;
      console.log('Submitting comment to:', commentUrl);
      
      // Prepare the payload for WordPress.com
      const payload = {
        content: commentData.content.trim(),
        author: commentData.author_name,
        email: commentData.author_email
      };
      
      // Make the API request
      const response = await fetch(commentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Check if the request was successful
      if (response.ok) {
        const responseData = await response.json();
        console.log('Comment submitted successfully to WordPress API', responseData);
        
        // Return the response data formatted to match our expected structure
        return {
          id: responseData.ID || Date.now(),
          author_name: responseData.author || commentData.author_name,
          date: responseData.date || new Date().toISOString(),
          content: responseData.content || commentData.content,
          remote: true
        };
      } else {
        // If API submission failed, throw an error to trigger the fallback
        const errorText = await response.text();
        console.warn('WordPress API comment submission failed:', response.status, errorText);
        throw new Error(`API submission failed: ${response.status}`);
      }
    } catch (apiError) {
      // If WordPress API submission fails, fall back to localStorage
      console.log('Falling back to localStorage for comment:', apiError.message);
      
      // Create a local comment object
      const commentText = commentData.content.trim();
      const timestamp = Date.now();
      const newComment = {
        ID: timestamp,
        id: timestamp,
        author_name: commentData.author_name,
        date: new Date().toISOString(),
        content: commentText,
        status: 'pending',
        local_only: true,
        post_id: commentData.post
      };
      
      // Save to localStorage as fallback
      saveCommentToLocalStorage(newComment);
      
      return newComment;
    }
  } catch (err) {
    console.error('Error handling comment:', err);
    throw new Error('Unable to process comment. Please try again later.');
  }
}

/**
 * Saves a comment to localStorage
 */
function saveCommentToLocalStorage(comment) {
  try {
    // Get existing comments from localStorage
    const existingCommentsJson = localStorage.getItem('bharathinsight_comments') || '[]';
    const existingComments = JSON.parse(existingCommentsJson);
    
    // Add new comment
    existingComments.push(comment);
    
    // Save back to localStorage
    localStorage.setItem('bharathinsight_comments', JSON.stringify(existingComments));
    console.log('Comment saved to localStorage');
  } catch (error) {
    console.error('Error saving comment to localStorage:', error);
  }
}

/**
 * Fetches posts by category slug directly from WordPress.com REST API
 * This works differently than the standard WordPress API
 */
export async function getPostsByCategory(categoryId, page = 1, perPage = 10) {
  try {
    console.log('getPostsByCategory called with categoryId:', categoryId, 'page:', page, 'perPage:', perPage);
    
    // WordPress.com REST API path for posts
    let url = `${API_URL}/posts`;
    let categorySlug = null;
    
    // Check if categoryId is a string that looks like a slug
    if (typeof categoryId === 'string' && !/^\d+$/.test(categoryId)) {
      categorySlug = categoryId;
      
      // Try to get the category ID from the slug
      try {
        const categoryData = await getCategoryBySlug(categoryId);
        if (categoryData && categoryData.ID) {
          categoryId = categoryData.ID;
          console.log('Resolved category slug to ID:', categoryId);
        }
      } catch (slugErr) {
        console.error('Error resolving category slug to ID:', slugErr);
        // Continue with slug-based query if ID resolution fails
      }
    }
    
    // Build the params object for the API request
    const params = {
      category: categoryId, // WordPress.com API accepts both IDs and slugs
      number: perPage,
      page: page,
      // Add comprehensive fields parameter to ensure we get all needed data
      fields: 'ID,date,title,content,excerpt,slug,featured_image,attachments,categories,tags,author'
    };
    
    const qs = buildQuery(params);
    const fullUrl = `${url}?${qs}`;
    
    console.log('Fetching category posts from URL:', fullUrl, 'for categoryId:', categoryId);
    
    const res = await fetch(fullUrl);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Category posts API error response:', errorText);
      throw new Error(`Failed to fetch category posts: ${res.status} ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log('Category posts response:', response);
    
    // For debugging empty posts
    if (!response.posts || response.posts.length === 0) {
      console.log('No posts found for category:', categoryId);
      
      // If no posts are found and we have a slug, try using it directly in the tag endpoint
      if (categorySlug) {
        try {
          // This is a fallback to the WordPress.com tags API as an alternative
          const baseApiUrl = API_URL.split('sites/')[0]; // Get base API URL without site info
          const tagUrl = `${baseApiUrl}read/tags/${categorySlug}/posts`;
          console.log('Trying alternative tag endpoint:', tagUrl);
          
          const tagRes = await fetch(tagUrl);
          if (tagRes.ok) {
            const tagResponse = await tagRes.json();
            console.log('Alternative tag response:', tagResponse);
            if (tagResponse.posts && tagResponse.posts.length > 0) {
              // Process the posts to match our expected format
              const formattedPosts = tagResponse.posts.map(post => ({
                id: post.ID,
                slug: post.slug,
                date: post.date,
                postDate: post.date,
                title: { rendered: post.title || '' },
                excerpt: { rendered: post.excerpt || '' },
                content: { rendered: post.content || '' },
                _embedded: {
                  'wp:featuredmedia': post.featured_image ? [{ source_url: post.featured_image }] : []
                },
                featured_image: post.featured_image,
                categories: post.categories || {},
                tags: post.tags || {},
                author: post.author || {}
              }));
              
              return {
                posts: formattedPosts,
                found: tagResponse.found || formattedPosts.length
              };
            }
          }
        } catch (tagErr) {
          console.error('Error with alternative tag approach:', tagErr);
        }
      }
    }
    
    // Process the posts to ensure they have the expected format
    const formattedPosts = (response.posts || []).map(post => {
      // Get featured image from multiple possible sources
      let featuredImage = post.featured_image || null;
      
      // Try to extract from attachments if not directly available
      if (!featuredImage && post.attachments) {
        const attachmentIds = Object.keys(post.attachments);
        for (const id of attachmentIds) {
          if (post.attachments[id].URL) {
            featuredImage = post.attachments[id].URL;
            break;
          }
        }
      }
      
      // Try to extract first image from content as last resort
      if (!featuredImage && post.content) {
        const imgMatch = post.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          featuredImage = imgMatch[1];
        }
      }
      
      return {
        id: post.ID,
        slug: post.slug,
        date: post.date,
        postDate: post.date,
        title: { rendered: post.title || '' },
        excerpt: { rendered: post.excerpt || '' },
        content: { rendered: post.content || '' },
        _embedded: {
          'wp:featuredmedia': featuredImage ? [{ source_url: featuredImage }] : []
        },
        featured_image: featuredImage,
        categories: post.categories || {},
        tags: post.tags || {},
        author: post.author || {}
      };
    });
    
    return {
      posts: formattedPosts,
      found: response.found || formattedPosts.length
    };
  } catch (err) {
    console.error(`Error fetching posts for category ${categoryId}:`, err);
    return { posts: [], found: 0 };
  }
}

/**
 * Searches for posts using the WordPress API based on a search query.
 * @param {string} searchQuery - The search term to look for in posts.
 * @param {object} params - Optional parameters like per_page, page, order, etc.
 * @returns {Promise<Array>} - A promise that resolves to an array of posts matching the search query.
 */
export async function searchPosts(searchQuery, params = {}) {
  // Handle empty search queries by returning an empty array
  if (!searchQuery || searchQuery.trim() === '') {
    return [];
  }

  try {
    // WordPress.com REST API uses different parameters
    const queryParams = {
      search: searchQuery,
      number: params.per_page || 10,
      page: params.page || 1,
      // Add fields parameter to ensure we get complete post data including images
      fields: 'ID,date,title,content,excerpt,slug,featured_image,attachments,categories,tags,author'
    };
    
    // Remove any WordPress self-hosted API specific parameters
    if (queryParams._embed) delete queryParams._embed;
    if (queryParams.per_page) delete queryParams.per_page;
    
    // Add any additional params
    Object.keys(params).forEach(key => {
      if (!['search', 'per_page', '_embed'].includes(key)) {
        queryParams[key] = params[key];
      }
    });
    
    // Build the query string
    const qs = buildQuery(queryParams);
    
    // Construct the API URL with the proper WordPress.com REST API format
    const url = `${API_URL}/posts${qs ? `?${qs}` : ''}`;
    console.log('Searching posts from URL:', url);
    
    // Fetch search results
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Search API error response:', errorText);
      throw new Error(`Failed to fetch search results: ${res.status} ${res.statusText}`);
    }
    
    // Parse the response
    const response = await res.json();
    console.log('WordPress.com search response:', response);
    
    // WordPress.com REST API v1.1 has a different structure
    // Posts are in response.posts, not directly in the response
    const wpPosts = response.posts || [];
    
    // Transform WordPress.com API response to match the format expected by components
    const formattedPosts = wpPosts.map(post => {
      // Get featured image from multiple possible sources
      let featuredImage = post.featured_image || null;
      
      // If no featured_image directly, try to extract from attachments
      if (!featuredImage && post.attachments) {
        const attachmentIds = Object.keys(post.attachments);
        for (const id of attachmentIds) {
          if (post.attachments[id].URL) {
            featuredImage = post.attachments[id].URL;
            break;
          }
        }
      }
      
      // If still no image, try to extract first image from content
      if (!featuredImage && post.content) {
        const imgMatch = post.content.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          featuredImage = imgMatch[1];
        }
      }
      
      // Format the post to match what components expect
      return {
        id: post.ID,
        slug: post.slug,
        date: post.date,
        postDate: post.date,
        title: {
          rendered: post.title || ''
        },
        excerpt: {
          rendered: post.excerpt || ''
        },
        content: {
          rendered: post.content || ''
        },
        _embedded: {
          'wp:featuredmedia': featuredImage ? [
            {
              source_url: featuredImage
            }
          ] : []
        },
        featured_image: featuredImage,
        categories: post.categories || {},
        tags: post.tags || {},
        author: post.author || {}
      };
    });
    
    // Log for debugging
    if (formattedPosts.length > 0) {
      console.log('First formatted search result:', formattedPosts[0]);
    } else {
      console.warn('No search results found');
    }
    
    return formattedPosts;
  } catch (err) {
    console.error('Error searching posts:', err);
    return [];
  }
}

const wordpressAPI = {
  getPosts,
  getCategoryBySlug,
  getPostBySlug,
  getCommentsByPost,
  createComment,
  searchPosts
};

export default wordpressAPI;
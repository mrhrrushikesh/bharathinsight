import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getPostBySlug,
  getCommentsByPost,
  createComment,
  getPosts as fetchSuggestedPosts
} from '../services/wordpressAPI';
import '../styles/ArticlePage.css';
import '../styles/WordPressContent.css';
import { CgProfile } from "react-icons/cg";
import { IoShareSocial } from 'react-icons/io5';
import ArticleSkeletonLoader from '../components/ArticleSkeletonLoader';

const ArticlePage = () => {
  const { category, slug } = useParams();
  
  // Post state
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState(null);
  
  // Comment form state
  const [commentData, setCommentData] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Suggested posts state
  const [suggestedPosts, setSuggestedPosts] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [suggestedError, setSuggestedError] = useState(null);

  // Function to strip HTML tags
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stripHtml(post.title.rendered),
        url: window.location.href,
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      alert('Share not supported. You can copy the URL: ' + window.location.href);
    }
  };

  // Twitter/X widget loading
  useEffect(() => {
    if (!post) return;
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    } else {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [post]);

  // Fetch main post
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    getPostBySlug(slug)
      .then(data => {
        if (isMounted) setPost(data);
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [slug]);

  // Fetch comments when post loads
  useEffect(() => {
    if (!post?.id) return;
    
    let isMounted = true;
    setCommentsLoading(true);
    setCommentsError(null);
    
    getCommentsByPost(post.id)
      .then(data => {
        if (isMounted) setComments(data);
      })
      .catch(err => {
        if (isMounted) setCommentsError(err.message);
      })
      .finally(() => {
        if (isMounted) setCommentsLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [post?.id]);

  // Fetch suggestions
  useEffect(() => {
    // Check if post exists and has categories (handling both array and object formats)
    if (!post) {
      console.log('No post available yet');
      return;
    }
    
    // Get the category ID - handle both array and object formats from WordPress.com API
    let categoryId;
    if (Array.isArray(post.categories) && post.categories.length > 0) {
      categoryId = post.categories[0];
    } else if (typeof post.categories === 'object' && Object.keys(post.categories).length > 0) {
      // If categories is an object, get the first key
      categoryId = Object.keys(post.categories)[0];
    } else {
      console.log('No usable categories found in post:', post);
      return;
    }
    
    let isMounted = true;
    const currentId = post.id;
    
    console.log('Fetching suggested posts with:', { categoryId, currentId, post });
    
    setSuggestedLoading(true);
    setSuggestedError(null);
    
    // Parameters for WordPress.com API
    fetchSuggestedPosts({
      category: categoryId,
      exclude: currentId,
      number: 10,
      fields: 'ID,date,title,content,excerpt,slug,featured_image,attachments,categories,tags'
    })
      .then(suggestions => {
        console.log('Suggestions received:', suggestions);
        if (isMounted) setSuggestedPosts(suggestions);
      })
      .catch(err => {
        console.error('Error fetching suggestions:', err);
        if (isMounted) setSuggestedError(err.message);
      })
      .finally(() => {
        if (isMounted) {
          setSuggestedLoading(false);
          console.log('Suggestion states:', {
            suggestedLoading: false,
            suggestedError: null,
            suggestedPostsLength: suggestedPosts?.length || 0
          });
        }
      });
      
    return () => { isMounted = false; };
  }, [post]);

  // Handle comment form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!commentData.author_name.trim()) {
      errors.author_name = 'Name is required';
    }
    
    if (!commentData.author_email.trim()) {
      errors.author_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(commentData.author_email)) {
      errors.author_email = 'Email is invalid';
    }
    
    if (!commentData.content.trim()) {
      errors.content = 'Content is required'; 
    } else if (commentData.content.length > 100) {
      errors.content = 'Content must be 100 characters or less';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setFormErrors({});
    
    console.log('Submitting comment for post ID:', post.id);
    
    try {
      // Prepare comment data for WordPress.com API
      const commentPayload = {
        post: post.id,
        author_name: commentData.author_name.trim(),
        author_email: commentData.author_email.trim(),
        content: commentData.content.trim()
      };
      
      console.log('Comment data being sent:', commentPayload);
      
      const response = await createComment(commentPayload);
      console.log('Comment submission response:', response);
      
      // Format the response to match the expected comment format for rendering
      const formattedComment = {
        id: response.ID || response.id,
        author_name: response.author || commentData.author_name,
        date: response.date || new Date().toISOString(),
        content: {
          rendered: response.content || commentData.content
        }
      };
      
      setComments(prev => [formattedComment, ...prev]);
      
      setCommentData({
        author_name: '',
        author_email: '',
        content: ''
      });
    } catch (err) {
      setFormErrors(prev => ({
        ...prev,
        submit: 'Failed to submit comment. Please try again later.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Improved function to check if Google ads have loaded
  function checkAdLoading() {
    const adContainers = document.querySelectorAll('.ad-container');
    
    adContainers.forEach((container, index) => {
      const adContent = container.querySelector('.ad-content');
      
      if (!adContent || 
          !adContent.innerHTML.trim() || 
          adContent.offsetHeight < 10 ||
          adContent.innerHTML.includes('display: none')) {
        
        container.style.display = 'none';
        container.setAttribute('data-ad-loaded', 'false');
      } else {
        container.classList.add('ad-loaded');
        container.setAttribute('data-ad-loaded', 'true');
      }
    });
    
    const suggestionList = document.querySelector('.bottom-suggestion-list');
    if (suggestionList) {
      const loadedAds = document.querySelectorAll('.ad-container[data-ad-loaded="true"]');
      if (loadedAds.length === 0) {
        suggestionList.classList.add('all-ads-hidden');
      }
    }
  }

  window.addEventListener('load', () => {
    checkAdLoading();
    setTimeout(checkAdLoading, 1000);
    setTimeout(checkAdLoading, 3000);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <ArticleSkeletonLoader />;
  
  if (error) return <div className="error-message">Could not load post: {error}</div>;
  if (!post) return <div className="error-message">Post not found</div>;

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const postDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className='article-wrapper'>
      <section className="post-hero">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / 
          <Link to={`/category/${category}`}>
            {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Link>
        </div>
        <div className="post-info title-container">
          <h1
            className="post-title"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="post-meta">
            <span className="post-date">{postDate}</span>
            <button className="share-button" onClick={handleShare} title="Share this article" aria-label="Share this article">
              <IoShareSocial size={24} />
            </button>
          </div>
        </div>
      </section>
        
      <section className="post-body two-columns">
        <main className='page-main'>
          <div className="content-container">
            {imageUrl && (
              <img
                className="post-image"
                src={imageUrl}
                alt={post.title.rendered}
              />
            )}
            <div className='pageStory-body'>
              <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
              
              <div className='pageStory-below'>
                <div className="comment-section-title">
                  <span>Comment Section</span>
                </div>
                {commentsLoading ? (
                  <div className="comments-loading">Loading comments...</div>
                ) : commentsError ? (
                  <div className="error-message">{commentsError}</div>
                ) : comments.length > 0 ? (
                  <div className="comments-section">
                    <h3>Comments ({comments.length})</h3>
                    <div className="comment-list">
                      {comments.map(comment => {
                        const date = new Date(comment.date);
                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
                        return (
                          <div key={comment.id} className="comment-item">
                            <div className='avatar'>
                              <CgProfile size={48} />
                            </div>
                            <div className="comment-author">
                              {comment.author_name} 
                              <div className='comment-date'>
                                {formattedDate}
                                {comment.local_only && <span className="pending-label"> </span>}
                              </div>
                            </div>
                            <div className="comment-content">
                              {/* Handle different comment content formats */}
                              {comment.content.rendered ? (
                                /* WordPress API format with rendered HTML */
                                <div dangerouslySetInnerHTML={{ __html: comment.content.rendered }} />
                              ) : typeof comment.content === 'string' ? (
                                /* Plain text comment (our local format) */
                                <p>{comment.content}</p>
                              ) : (
                                /* Fallback for any other format */
                                <p>Comment content unavailable</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                
                <div className="comment-form">
                  <h3>Leave a Comment</h3>
                  {formErrors.submit && (
                    <div className="form-error">{formErrors.submit}</div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <input
                        id="author_name"
                        name="author_name"
                        type="text"
                        placeholder="  "
                        value={commentData.author_name}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="author_name">Name*</label>
                      {formErrors.author_name && (
                        <span className="error-message">{formErrors.author_name}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        id="author_email"
                        name="author_email"
                        type="email"
                        placeholder="  "
                        value={commentData.author_email}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="author_email">Email*</label>
                      {formErrors.author_email && (
                        <span className="error-message">{formErrors.author_email}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <textarea
                        id="content"
                        name="content"
                        placeholder="  "
                        value={commentData.content}
                        onChange={handleInputChange}
                        maxLength={100}
                        required
                      />
                      <label htmlFor="content">Comment*</label>
                      <div className="char-count">
                        {commentData.content.length}/100 characters
                      </div>
                      {formErrors.content && (
                        <span className="error-message">{formErrors.content}</span>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </form>
                </div>
                {!suggestedLoading && !suggestedError && suggestedPosts.length > 0 && (
                  <div className="bottom-suggestions">
                    <h2 className="bottom-suggestions-title">
                      More from {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h2>
                    <div className="bottom-suggestion-list">
                      {suggestedPosts.slice(0, 6).map((item, index) => (
                        <React.Fragment key={`content-block-${index}`}>
                          <div className="bottom-suggestion-item">
                            <Link to={`/${category}/${item.slug}`}>
                              {/* Check for featured image in multiple possible locations */}
                              {(item._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                                item.featured_image || 
                                (item._embedded?.['wp:featuredmedia']?.[0] && item._embedded['wp:featuredmedia'][0].source_url)) && (
                                <img
                                  src={item._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                                       item.featured_image || 
                                       item._embedded?.['wp:featuredmedia']?.[0]?.source_url}
                                  alt={item.title.rendered}
                                  className="bottom-suggestion-thumb"
                                  loading="lazy"
                                />
                              )}
                              <div className="bottom-suggestion-title">{item.title.rendered}</div>
                            </Link>
                          </div>
                          <div className="ad-container" id={`suggestion-ad-${index}`}>
                            <div className="ad-placeholder">
                              <div className="ad-content" id={`ad-content-${index}`}></div>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
                <div className="Ad-btm"></div>
              </div>
            </div>
          </div>
        </main>
        <aside className='page-aside'>
          {!suggestedLoading && !suggestedError && suggestedPosts.length > 0 && (
            <aside className="suggestions-container">
              <h2 className="suggestions-title">
                More in <span className="capitalize">{category.replace('-', ' ')}</span>
              </h2>
              <ol className="suggestion-list">
                {suggestedPosts.slice(0, 5).map((item, i) => {
                  // Get featured image from multiple possible locations
                  const thumb = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                              item.featured_image || 
                              (item._embedded?.['wp:featuredmedia']?.[0] && item._embedded['wp:featuredmedia'][0].source_url);
                  const url = `/${category}/${item.slug}`;
                  return (
                    <li key={item.id} className="suggestion-item">
                      {i === 0 && thumb && (
                        <div className="suggestion-image-container">
                          <Link to={url}>
                            <img
                              src={thumb}
                              alt={item.title.rendered}
                              className="suggestion-thumb"
                              loading="lazy"
                            />
                          </Link>
                        </div>
                      )}
                      <div className="suggestion-text">
                        <span className="suggestion-number">{i + 1}.</span>
                        <Link to={url} className="suggestion-link">
                          {item.title.rendered}
                        </Link>
                      </div>
                      {i < 4 && <hr className="suggestion-divider" />}
                    </li>
                  );
                })}
              </ol>
            </aside>
          )}
        </aside>
      </section>
    </div>
  );
};

export default ArticlePage;
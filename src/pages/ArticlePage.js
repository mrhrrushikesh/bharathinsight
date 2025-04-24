import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, getPosts } from '../services/wordpressAPI';
import '../styles/ArticlePage.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const contentRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [collapsedHeight, setCollapsedHeight] = useState(0);

  useEffect(() => {
    async function fetchPostAndRelated() {
      try {
        setLoading(true);
        setError(null);
        const postData = await getPostBySlug(slug);
        console.log("Fetched Post Data:", postData); // Debug log
        setPost(postData);

        const categoryId = postData.categories[0];
        const related = await getPosts({
          categories: categoryId,
          per_page: 5,
          _embed: true,
          exclude: postData.id
        });
        setRelatedPosts(related);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPostAndRelated();
  }, [slug]);

  useEffect(() => {
    if (post && contentRef.current) {
      const fullHeight = contentRef.current.scrollHeight;
      setCollapsedHeight(fullHeight / 2);
    }
  }, [post]);

  if (loading) return <div className="loading-message">Loading post…</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!post) return <div className="error-message">Post not found.</div>;

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const postDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <>
      <section className="post-hero">
        <Link to="/" className="back-link">← Back to all posts</Link>
        <div className="hero-inner">
          <h1
            className="post-title"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="post-meta">
            <span className="post-date">{postDate}</span>
          </div>
        </div>
      </section>

      <section className="post-body">
        <div className="content-container">
          {imageUrl && (
            <img
              className="post-image"
              src={imageUrl}
              alt={post.title.rendered}
            />
          )}

          <div
            ref={contentRef}
            className={`post-content ${isCollapsed ? 'collapsed' : ''}`}
            style={isCollapsed ? { maxHeight: collapsedHeight } : {}}
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {isCollapsed && (
            <>
              <div className="shade" />
              <button
                className="read-more-btn"
                onClick={() => setIsCollapsed(false)}
              >
                Read More ↓
              </button>
            </>
          )}
        </div>
        {relatedPosts.length > 0 && (
          <div className="most-read">
            <h2>MOST READ</h2>
            {relatedPosts[0]._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
              <img
                src={relatedPosts[0]._embedded['wp:featuredmedia'][0].source_url}
                alt={relatedPosts[0].title.rendered}
              />
            )}
            <ol>
              {relatedPosts.map((relatedPost) => (
                <li key={relatedPost.id}>
                  <Link to={`/:category/${relatedPost.slug}`} dangerouslySetInnerHTML={{ __html: relatedPost.title.rendered }} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </>
  );
};

export default ArticlePage;

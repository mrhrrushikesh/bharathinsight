// src/pages/ArticlePage.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../services/wordpressAPI';
import '../styles/ArticlePage.css';

const ArticlePage = () => {
  const { category, slug } = useParams();

  const [post, setPost]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // “Read more” collapse
  const contentRef             = useRef(null);
  const [isCollapsed, setIsCollapsed]       = useState(true);
  const [collapsedHeight, setCollapsedHeight] = useState(0);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);
        const postData = await getPostBySlug(slug);
        setPost(postData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post && contentRef.current) {
      const fullHeight = contentRef.current.scrollHeight;
      setCollapsedHeight(fullHeight / 2);
    }
  }, [post]);

  if (loading) return <div className="loading-message">Loading post…</div>;
  if (error)   return <div className="error-message">Could not load post.</div>;
  if (!post)   return <div className="error-message">Post not found.</div>;

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const postDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <>
      <section className="post-hero">
        <Link to="/" className="back-link">← Back to all posts</Link>
        <div className="hero-inner">
          {/* Breadcrumbs */}
          <nav className="post-breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <Link to={`/${category}`}>{category}</Link>
            <span className="separator">/</span>
            <span className="current-title" title={post.title.rendered}>
              {post.title.rendered}
            </span>
          </nav>

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
      </section>
    </>
  );
};

export default ArticlePage;

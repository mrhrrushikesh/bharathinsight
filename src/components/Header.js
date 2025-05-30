import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/HeaderNav.css";
import { FaSearch } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const date = new Date().getFullYear();

  // Search bar state
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Show search bar (icon in header toggles bar open)
  const handleSearchIconClick = () => {
    if (!searchBarOpen) {
      setSearchBarOpen(true);
    }
  };

  // Submit search (icon in bar or Enter)
  const handleSearchSubmit = (e) => {
    e && e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchBarOpen(false);
      setSearchQuery('');
    } else {
      // If empty, just close the bar
      setSearchBarOpen(false);
      setSearchQuery('');
    }
  };

  // Auto-focus on input when search bar opens
  useEffect(() => {
    if (searchBarOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchBarOpen]);

  // Hide menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Allow Enter to submit search
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo-bar">
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="logo-container">
            <Link to="/">
              <img
                className="logo"
                src="/assets/logo.png"
                alt="Bharath Insight Logo"
              />
            </Link>
          </div>
          <div className="right-container">
            <nav className="nav-links">
              {["home", "trending", "tech", "career", "movies", "crypto"].map(
                (slug) => (
                  <Link
                    key={slug}
                    to={`/${slug === "home" ? "" : slug}`}
                    className="nav-link"
                  >
                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                  </Link>
                )
              )}
            </nav>
            {!searchBarOpen && (
              <button
                className="header-search-btn"
                aria-label="Search"
                onClick={handleSearchIconClick}
                tabIndex={0}
                type="button"
              >
                <FaSearch />
              </button>
            )}
          </div>
        </div>
        <form
          className={`header-search-bar${searchBarOpen ? " open" : ""}`}
          onSubmit={handleSearchSubmit}
        >
          <input
            ref={searchInputRef}
            type="text"
            className="header-search-input"
            placeholder="Search news, topics, or articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search"
          />
          {searchBarOpen && (
            <button
              type="submit"
              className="header-search-btn in-bar"
              aria-label="Submit search"
              tabIndex={0}
            >
              <FaSearch />
            </button>
          )}
        </form>
      </header>

      {/* Mobile Drawer */}
      <aside
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        ref={menuRef}
      >
        <div className="mobile-menu-header">
          <div className="logo-container-menu">
            <Link to="/">
            <img
                className="logo"
                src="/assets/logo.png"
                alt="Bharath Insight Logo"
              />
            </Link>
          </div>
          <button
            className="close-menu"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            X
          </button>
        </div>
        <nav className="mobile-nav-links">
          {[
            "Trending",
            "Tech",
            "Finance",
            "Movies",
            "Business",
            "Sports",
            "Health",
            "Career",
            "Politics",
            "World",
            "Crypto",
          ].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </nav>
        <footer className="mobile-footer">
          <p className="footer-copyright-menu">
            Copyright @ {date}. BharathInsight - All Rights Reserved
          </p>
        </footer>
      </aside>
    </>
  );
};

export default Header;

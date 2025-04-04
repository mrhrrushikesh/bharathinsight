import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/HeaderNav.css";

const Header = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const scrollingDown = currentScrollPos > prevScrollPos;

      // Hide nav if scrolling down beyond ~50px; show if scrolling up
      if (currentScrollPos > 50 && scrollingDown) {
        setHideNav(true);
      } else {
        setHideNav(false);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <header className={`header ${hideNav ? "hide-nav" : ""}`}>
      {/* Black bar for logo (always visible) */}
      <div className="logo-bar">
        <div className="logo-container">
          <span className="live-dot"></span>
          <Link to="/">
            <h1 className="logo">Bharath Insight</h1>
          </Link>
        </div>
      </div>

      {/* Nav links: slide up behind .logo-bar when hideNav is true */}
      <nav className="nav-links">
        <Link to="/trending" className="nav-link">Trending</Link>
        <Link to="/tech" className="nav-link">Tech</Link>
        <Link to="/finance" className="nav-link">Finance</Link>
        <Link to="/movies" className="nav-link">Movies</Link>
        <Link to="/business" className="nav-link">Business</Link>
        <Link to="/sports" className="nav-link">Sports</Link>
        <Link to="/health" className="nav-link">Health</Link>
        <Link to="/jobs" className="nav-link">Jobs</Link>
        <Link to="/world" className="nav-link">World</Link>
        <Link to="/crypto" className="nav-link">Crypto</Link>
      </nav>
    </header>
  );
};

export default Header;

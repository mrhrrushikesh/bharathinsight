import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // Import CSS file
import XLogo from '../twitter.svg'; // Placeholder - replace with your X logo SVG

const Footer = () => {
    const date = new Date().getFullYear();
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        // Here you would integrate with your newsletter service
        console.log('Subscribing email:', email);
        alert('Thank you for subscribing to our newsletter!');
        setEmail('');
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-logo">
                        <Link to="/">
                            <img src="/assets/logo.png" alt="Bharath Insight" />
                        </Link>
                        <p className="footer-tagline">Insight That Matters</p>
                    </div>
                    <div className="footer-links-social">
                        <div className="footer-links-section">
                            <h4 className="footer-section-title">Categories</h4>
                            <div className="footer-links">
                                <Link to="/trending">Trending</Link>
                                <Link to="/tech">Tech</Link>
                                <Link to="/finance">Finance</Link>
                                <Link to="/movies">Movies</Link>
                                <Link to="/crypto">Crypto</Link>
                                <Link to="/career">Career</Link>
                                <Link to="/politics">Politics</Link>
                                <Link to="/world">World</Link>
                            </div>
                        </div>
                        <div className="footer-newsletter">
                            <h4 className="footer-section-title">Subscribe to Newsletter</h4>
                            <p className="newsletter-desc">Stay updated with our latest news and articles</p>
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <input 
                                    type="email" 
                                    placeholder="Your email address" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit">Subscribe</button>
                            </form>
                        </div>
                        <div className="footer-connect">
                            <h4 className="footer-section-title">Connect With Us</h4>
                            <div className="footer-social-icons">
                                <a href="https://x.com/BharathInsight" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <img src={XLogo} alt="X Logo" />
                                </a>
                                
                            </div>
                            <div className="footer-contact-info">
                                <p><strong>Email:</strong> bharathinsightnews@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="footer-bottom-links">
                        <a href="/about">About Us</a>
                        <a href="/contact-us">Contact Us</a>
                        <a href="/privacy-policy">Privacy Policy</a>
                        <a href="/cookie-policy">Cookie Policy</a>
                        <a href="/terms-of-use">Terms of Use</a>
                    </div>
                    <p className="footer-copyright">Copyright {date} BharathInsight. All Rights Reserved</p>
                </div>
                <div className="red-shade"></div>
            </div>
        </footer>
    );
};

export default Footer;
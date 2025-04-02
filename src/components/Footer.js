import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // Import CSS file
import FirstpostLogo from '../newsco.svg'; // Assuming you have the logo as SVG
import InstagramLogo from '../icons8-instagram.svg'; // Placeholder - replace with your Instagram logo SVG
import XLogo from '../twitter.svg'; // Placeholder - replace with your X logo SVG



const Footer = () => {

    const date = new Date().getFullYear();


    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-logo">
                        <Link to="/">
                            <img src={FirstpostLogo} alt="Firstpost Logo" />
                        </Link>
                    </div>
                    <div className="footer-links-social">
                        <div className="footer-links">
                            <Link to="/trending">Trending</Link>
                            <Link to="/finance">Finance</Link>
                            <Link to="/movies">Movies</Link>
                            <Link to="/crypto">Crypto</Link>
                            
                        </div>
                        <div className="footer-social-icons">
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                                <img src={InstagramLogo} alt="Instagram Logo" />
                            </a>
                            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                                <img src={XLogo} alt="X Logo" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copyright">Copyright @ {date}. BharathInsight - All Rights Reserved</p>
                    <div className="footer-bottom-links">
                        <a href="/contact-us">CONTACT US</a>
                        <a href="/privacy-policy">PRIVACY POLICY</a>
                        <a href="/cookie-policy">COOKIE POLICY</a>
                        <a href="/terms-of-use">TERMS OF USE</a>
                    </div>
                </div>
                <div className="red-shade"></div>
            </div>
        </footer>
    );
};

export default Footer;
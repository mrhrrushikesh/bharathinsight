import React from 'react';
import '../styles/contactus.css';

const ContactUs = () => {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Last updated: May 17, 2025</p>
      </div>
      <div className="contact-content">
        <div className="contact-section">
          <h2>Get in Touch</h2>
          <p>Thank you for visiting Bharath Insight. We value your feedback, questions, and suggestions. Our team is dedicated to providing you with the latest news and insights about India and the world.</p>
          
          <div className="contact-cta">
            <p>For all inquiries, please email us at: <br />
            <a href="mailto:bharathinsightnews@gmail.com" className="contact-email">bharathinsightnews@gmail.com</a></p>
          </div>
          
          <p>We strive to respond to all messages within 24-48 hours during business days.</p>
        </div>
        
        <div className="contact-section">
          <h2>Sponsorship & Advertising Opportunities</h2>
          <p><span className="contact-highlight">Bharath Insight is now accepting sponsorships and advertising partnerships.</span> We offer a variety of promotional opportunities for brands that align with our values and would be of interest to our growing audience.</p>
          
          <p>Our sponsorship options include:</p>
          <ul>
            <li>Banner advertisements</li>
            <li>Sponsored content and articles</li>
            <li>Newsletter sponsorships</li>
            <li>Social media promotions</li>
            <li>Category or section sponsorships</li>
            <li>Event partnerships</li>
          </ul>
          
          <p>For sponsorship inquiries and rate information, please contact us at <a href="mailto:bharathinsightnews@gmail.com" className="contact-email">bharathinsightnews@gmail.com</a> with "Sponsorship Inquiry" in the subject line.</p>
          
          <p>We carefully review all potential sponsors to ensure they align with our commitment to quality journalism and our audience's interests.</p>
        </div>
        
        <div className="contact-section">
          <h2>Content Submissions</h2>
          <p>Are you an expert in your field? Do you have unique insights on current events in India or globally? Bharath Insight welcomes guest contributors and opinion pieces from qualified individuals.</p>
          
          <p>To submit your content for consideration, please email us at <a href="mailto:bharathinsightnews@gmail.com" className="contact-email">bharathinsightnews@gmail.com</a> with "Content Submission" in the subject line. Please include:</p>
          <ul>
            <li>Your full name and brief bio</li>
            <li>Your proposed topic or a draft of your article</li>
            <li>Any relevant credentials or previous writing samples</li>
          </ul>
          
          <p>Our editorial team reviews all submissions and will contact you if we're interested in publishing your content.</p>
        </div>
        
        <div className="contact-section">
          <h2>Report an Issue</h2>
          <p>If you encounter any technical issues while using our website, or if you would like to report an error in our content, please let us know at <a href="mailto:bharathinsightnews@gmail.com" className="contact-email">bharathinsightnews@gmail.com</a> with "Website Issue" in the subject line.</p>
          
          <p>Please provide as much detail as possible, including:</p>
          <ul>
            <li>The page or article where you encountered the issue</li>
            <li>A description of the problem</li>
            <li>Screenshots, if applicable</li>
            <li>The device and browser you were using</li>
          </ul>
          
          <p>Your feedback helps us improve the Bharath Insight experience for all our readers.</p>
        </div>
        
        <div className="contact-section">
          <h2>Privacy Concerns</h2>
          <p>If you have any questions or concerns about your privacy while using Bharath Insight, please refer to our <a href="/privacy-policy">Privacy Policy</a> and <a href="/cookie-policy">Cookie Policy</a>.</p>
          
          <p>For specific privacy-related inquiries, please contact us at <a href="mailto:bharathinsightnews@gmail.com" className="contact-email">bharathinsightnews@gmail.com</a> with "Privacy Concern" in the subject line.</p>
        </div>
        
        <div className="contact-section">
          <h2>Connect With Us</h2>
          <p>We invite you to follow Bharath Insight on social media to stay updated with our latest news and features:</p>
          <ul>
            <li>Twitter: <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">@bharathinsight</a></li>
          </ul>
          
          <p>Thank you for being part of the Bharath Insight community. We look forward to hearing from you!</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

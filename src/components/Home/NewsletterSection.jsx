import { Mail } from 'lucide-react';

const NewsletterSection = () => {
  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-content scroll-reveal">
          <h2 className="newsletter-title">Stay Updated</h2>
          <p className="newsletter-description">
            Get the latest news about HIVE, HBD, and exclusive trading opportunities delivered to your inbox.
          </p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input"
            />
            <button className="newsletter-button">
              <Mail size={20} />
              Subscribe
            </button>
          </div>
          <p className="newsletter-disclaimer">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;

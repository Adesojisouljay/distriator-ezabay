import { Bitcoin, Coins, DollarSign, CheckCircle } from 'lucide-react';
import safe from "../../assets/safe-icon.webp"

const AboutSection = () => {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text glass scroll-reveal">
            <h2 className="section-title" style={{ textAlign: 'left', marginLeft: 0 }}>About Ezabay</h2>
            <p className="about-description">
              Ezabay is revolutionizing the way people interact with the HIVE ecosystem. Bridging the gap between traditional finance and decentralized currencies.
            </p>
            <p className="about-description">
              Our mission is to democratize cryptocurrency trading while maintaining the highest standards
              of security and user experience.
            </p>
            <div className="about-features">
              <div className="about-feature glass-hover">
                <CheckCircle className="about-feature-icon" size={20} />
                <span>Regulated and Compliant</span>
              </div>
              <div className="about-feature glass-hover">
                <CheckCircle className="about-feature-icon" size={20} />
                <span>Expert Team</span>
              </div>
              <div className="about-feature glass-hover">
                <CheckCircle className="about-feature-icon" size={20} />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
          <div className="about-image scroll-reveal">
            <div className="about-crypto-visual">
              <img className="hero-safe-img" src={safe} alt="Safe Icon" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
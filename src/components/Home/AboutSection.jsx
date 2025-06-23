import { Bitcoin, Coins, DollarSign, CheckCircle } from 'lucide-react';
import safe from "../../assets/safe-icon.webp"

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text scroll-reveal">
            <h2 className="section-title">About Ezabay</h2>
            <p className="about-description">
              Ezabay is revolutionizing the way people interact with the HIVE ecosystem. Founded by crypto 
              enthusiasts, we bridge the gap between traditional finance and decentralized currencies, 
              making HIVE and HBD accessible to everyone.
            </p>
            <p className="about-description">
              Our mission is to democratize cryptocurrency trading while maintaining the highest standards 
              of security and user experience. We believe in the power of decentralized finance and are 
              committed to helping our users maximize their crypto potential.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" size={24} />
                <span>Regulated and Compliant</span>
              </div>
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" size={24} />
                <span>Expert Team</span>
              </div>
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" size={24} />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
          <div className="about-image scroll-reveal">
            <div className="about-crypto-visual">
              <img className="hero-safe-img" src={safe} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="header" style={{ background: 'var(--gradient-mesh)' }}>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge animate-fadeInUp">
            <span className="badge-dot"></span>
            Seamless Crypto Experience
          </div>
          <h1 className="hero-title animate-fadeInUp">
            Your Gateway to the <br />
            <span className="text-gradient">Crypto Future</span>
          </h1>
          <h2 className="hero-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Buy HIVE & HBD Easily, Trade, and Spend
          </h2>
          <p className="hero-description animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            Empower your digital journey with Ezabay. Access high-speed transactions,
            minimal fees, and up to 55% cashback rewards on your daily spends.
          </p>
          <div className="hero-buttons animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <Link to="/login" className="btn-primary">Get Started Now</Link>
            <a href="#features" className="btn-secondary">Explore Features</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
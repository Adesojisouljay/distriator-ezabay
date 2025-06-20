import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="header">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to Ezabay
            {/* <Coins className="crypto-icon animate-float" size={48} /> */}
          </h1>
          <h2 className="hero-subtitle">
            Buy HIVE & HBD Easily, Trade, and Spend
          </h2>
          <p className="hero-description">
            Join Ezabay to start buying HIVE and HBD with ease. Our platform offers seamless transactions, 
            minimal fees, and access to SpendHBD and Distraitor for payments and rewards. Plus, get up to 
            55% cashback when you pay with HIVE or HBD! Get started today and empower your digital journey.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary animate-glow">Get Started</Link>
            <a href="#features" className="btn-secondary">Learn More</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
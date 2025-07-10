import { TrendingUp, Shield, Users } from 'lucide-react';

const TradingFeatures = () => {
  return (
    <section className="trading-features">
      <div className="container">
        <div className="scroll-reveal">
          <h2 className="section-title">Powerful Exchange Features</h2>
          <p className="section-subtitle">
          Trade, connect, and convert with tools built for today’s crypto users
          </p>
        </div>
        
        <div className="trading-grid">
          <div className="trading-feature scroll-reveal">
            <TrendingUp className="trading-icon" size={40} />
            <h3>Real-time Prices</h3>
            <p>Stay on top of market movements with real-time price updates.</p>
          </div>
          <div className="trading-feature scroll-reveal">
            <Shield className="trading-icon" size={40} />
            <h3>Swift Token & Fiat Conversion</h3>
            <p>Instantly convert crypto to fiat or other tokens, powered by low-latency swaps.</p>
          </div>
          <div className="trading-feature scroll-reveal">
            <Users className="trading-icon" size={40} />
            <h3>Discord Community</h3>
            <p>Chat with us, get support, and connect with other traders in our live Discord server.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingFeatures;
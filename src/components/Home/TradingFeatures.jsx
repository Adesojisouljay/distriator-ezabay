import { TrendingUp, Shield, Users } from 'lucide-react';

const TradingFeatures = () => {
  return (
    <section className="trading-features">
      <div className="container">
        <div className="scroll-reveal">
          <h2 className="section-title">Advanced Trading Features</h2>
          <p className="section-subtitle">
            Professional tools for every type of trader
          </p>
        </div>
        
        <div className="trading-grid">
          <div className="trading-feature scroll-reveal">
            <TrendingUp className="trading-icon" size={40} />
            <h3>Real-time Charts</h3>
            <p>Advanced charting tools with technical indicators for informed trading decisions.</p>
          </div>
          <div className="trading-feature scroll-reveal">
            <Shield className="trading-icon" size={40} />
            <h3>Order Protection</h3>
            <p>Smart order routing and protection against market manipulation.</p>
          </div>
          <div className="trading-feature scroll-reveal">
            <Users className="trading-icon" size={40} />
            <h3>Social Trading</h3>
            <p>Follow successful traders and copy their strategies automatically.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingFeatures;
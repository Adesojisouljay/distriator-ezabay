import React from 'react';
import { TrendingUp, ArrowDownUp, MessageCircle } from 'lucide-react';

const TradingFeatures = () => {
  return (
    <section className="section trading-features modern-trading-section">
      <div className="container">
        <div className="section-header scroll-reveal">
          <div className="section-badge-pill">
            <span>Core Ecosystem</span>
          </div>
          <h2 className="section-title">Designed for Everyday Convenience</h2>
          <p className="section-subtitle">
            Trade, connect, and convert with institutional reliability built for modern crypto traders and merchants.
          </p>
        </div>

        <div className="trading-grid">
          <div className="trading-feature glass scroll-reveal">
            <div className="trading-icon-wrap icon-green">
              <TrendingUp className="trading-icon" size={32} />
            </div>
            <h3>Real-Time Pricing Engine</h3>
            <p>Direct low-latency order routing guarantees accurate market pricing across HIVE, HBD, USDT, and NGN.</p>
          </div>

          <div className="trading-feature glass scroll-reveal">
            <div className="trading-icon-wrap icon-cyan">
              <ArrowDownUp className="trading-icon" size={32} />
            </div>
            <h3>Swift Fiat & Crypto Conversion</h3>
            <p>Automated liquidity pools execute your conversions in seconds without manual delays or banking hitches.</p>
          </div>

          <div className="trading-feature glass scroll-reveal">
            <div className="trading-icon-wrap icon-blue">
              <MessageCircle className="trading-icon" size={32} />
            </div>
            <h3>Active Community Support</h3>
            <p>Direct access to our 24/7 dedicated support desk and Discord community for rapid merchant and trader guidance.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingFeatures;
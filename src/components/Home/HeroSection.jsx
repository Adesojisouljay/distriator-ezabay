import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowRight, 
  HiSparkles, 
  HiShieldCheck, 
  HiBolt, 
  HiCheckBadge,
  HiArrowsUpDown 
} from 'react-icons/hi2';
import { SiHive } from 'react-icons/si';

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [fiatAmount, setFiatAmount] = useState('50000');
  const [selectedCrypto, setSelectedCrypto] = useState('HIVE');

  // Interactive estimates
  const hivePriceNgn = 285;
  const hbdPriceNgn = 1450;
  
  const numericAmount = parseFloat(fiatAmount.replace(/,/g, '')) || 0;
  const cryptoEstimated = selectedCrypto === 'HIVE'
    ? (numericAmount / hivePriceNgn).toFixed(2)
    : (numericAmount / hbdPriceNgn).toFixed(2);

  return (
    <section className="modern-hero-section">
      <div className="hero-ambient-glow hero-glow-1"></div>
      <div className="hero-ambient-glow hero-glow-2"></div>
      
      <div className="container hero-container">
        {/* Left Column: Headline and Pitch */}
        <div className="hero-text-col">
          <div className="hero-pill-badge">
            <span className="hero-pulse-dot"></span>
            <span className="badge-text">Next-Gen Hive & HBD Gateway</span>
          </div>

          <h1 className="hero-main-title">
            Buy, Swap & Spend <br />
            <span className="hero-gradient-text">HIVE & HBD</span> Instantly
          </h1>

          <p className="hero-lead-text">
            The fastest, non-custodial gateway connecting local fiat directly to the Hive blockchain.
            Zero gas network fees, sub-3-second settlements, and up to 55% cashback rewards on your daily spends.
          </p>

          <div className="hero-cta-group">
            <Link to="/login" className="hero-btn-primary">
              <span>Start Trading Now</span>
              <HiArrowRight className="btn-icon" size={18} />
            </Link>
            <a href="#features" className="hero-btn-secondary">
              <HiSparkles className="btn-icon" size={18} />
              <span>Explore Features</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="hero-trust-grid">
            <div className="trust-pill">
              <HiBolt className="trust-icon text-accent-green" size={16} />
              <span>~3s Finality</span>
            </div>
            <div className="trust-pill">
              <HiShieldCheck className="trust-icon text-accent-cyan" size={16} />
              <span>Non-Custodial</span>
            </div>
            <div className="trust-pill">
              <SiHive className="trust-icon text-accent-red" size={15} />
              <span>0% Gas Fees</span>
            </div>
            <div className="trust-pill">
              <HiCheckBadge className="trust-icon text-accent-green" size={16} />
              <span>55% Cashback</span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Interactive Web3 Terminal Preview */}
        <div className="hero-visual-col">
          {/* Top Floating Badge */}
          <div className="hero-floating-chip chip-top animate-float">
            <div className="chip-indicator"></div>
            <div className="chip-text">
              <span className="chip-title">Instant Settlement</span>
              <span className="chip-sub">✓ Confirmed in 2.8s</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="hero-glass-terminal">
            {/* Terminal Header & Market Ticker */}
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="terminal-live-badge">
                <span className="live-dot"></span> LIVE RATES
              </div>
            </div>

            {/* Quick Market Ticker Pill Strip */}
            <div className="terminal-ticker-strip">
              <div className="ticker-item">
                <span className="ticker-sym">HIVE</span>
                <span className="ticker-price">$0.284</span>
                <span className="ticker-change text-green">+4.1%</span>
              </div>
              <div className="ticker-divider"></div>
              <div className="ticker-item">
                <span className="ticker-sym">HBD</span>
                <span className="ticker-price">$1.000</span>
                <span className="ticker-change text-cyan">Stable</span>
              </div>
              <div className="ticker-divider"></div>
              <div className="ticker-item">
                <span className="ticker-sym">USDT</span>
                <span className="ticker-price">₦1,450</span>
                <span className="ticker-change text-muted">0.0%</span>
              </div>
            </div>

            {/* Swap Card Body */}
            <div className="terminal-swap-box">
              <div className="swap-tabs">
                <button 
                  type="button" 
                  className={`swap-tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('buy')}
                >
                  Buy Crypto
                </button>
                <button 
                  type="button" 
                  className={`swap-tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sell')}
                >
                  Sell Crypto
                </button>
              </div>

              {/* Pay Field */}
              <div className="swap-input-row">
                <div className="swap-input-labels">
                  <span className="input-label-text">{activeTab === 'buy' ? 'You Pay' : 'You Send'}</span>
                  <span className="input-balance-hint">Bank Transfer / Card</span>
                </div>
                <div className="swap-field-wrapper">
                  <input
                    type="text"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="swap-numeric-input"
                    placeholder="50000"
                  />
                  <div className="swap-token-badge">
                    <span className="currency-flag">🇳🇬</span>
                    <span className="currency-symbol">NGN</span>
                  </div>
                </div>
              </div>

              {/* Swap Switcher Divider */}
              <div className="swap-divider-wrap">
                <div className="swap-switch-circle" title="Instant Rate Conversion">
                  <HiArrowsUpDown size={18} />
                </div>
              </div>

              {/* Receive Field */}
              <div className="swap-input-row">
                <div className="swap-input-labels">
                  <span className="input-label-text">{activeTab === 'buy' ? 'You Receive (Est.)' : 'You Get (Est.)'}</span>
                  <span className="input-balance-hint">0% Network Slippage</span>
                </div>
                <div className="swap-field-wrapper">
                  <div className="swap-computed-value">
                    {cryptoEstimated}
                  </div>
                  <div className="crypto-select-group">
                    <button 
                      type="button"
                      className={`crypto-pill ${selectedCrypto === 'HIVE' ? 'active' : ''}`}
                      onClick={() => setSelectedCrypto('HIVE')}
                    >
                      <SiHive size={14} className="text-accent-red" />
                      <span>HIVE</span>
                    </button>
                    <button 
                      type="button"
                      className={`crypto-pill ${selectedCrypto === 'HBD' ? 'active' : ''}`}
                      onClick={() => setSelectedCrypto('HBD')}
                    >
                      <span className="dollar-badge">$</span>
                      <span>HBD</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Exchange Meta Rate */}
              <div className="swap-meta-info">
                <div className="meta-line">
                  <span>Guaranteed Rate</span>
                  <span className="meta-value">
                    1 {selectedCrypto} ≈ {selectedCrypto === 'HIVE' ? '₦285.00' : '₦1,450.00'}
                  </span>
                </div>
                <div className="meta-line">
                  <span>Network Gas Fee</span>
                  <span className="meta-value text-green">₦0.00 (Hive Free)</span>
                </div>
              </div>

              {/* Action Button */}
              <Link to="/login" className="terminal-submit-btn">
                <span>{activeTab === 'buy' ? `Buy ${selectedCrypto} Now` : `Sell ${selectedCrypto} Now`}</span>
                <HiArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Bottom Floating Badge */}
          <div className="hero-floating-chip chip-bottom animate-float-delayed">
            <div className="chip-badge-icon">🎁</div>
            <div className="chip-text">
              <span className="chip-title">Distriator Cashback</span>
              <span className="chip-sub">+35.50 HBD Earned Today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
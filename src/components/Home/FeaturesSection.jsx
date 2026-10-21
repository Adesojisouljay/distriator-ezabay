import React from 'react';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  Zap, 
  Coins, 
  TrendingUp, 
  KeyRound 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <ArrowLeftRight className="feature-icon-svg" />,
      title: "Direct Fiat-to-Crypto Rails",
      description: "Quickly convert Nigerian Naira and stablecoins into HIVE & HBD via automated bank transfers.",
      tag: "Instant Payouts"
    },
    {
      icon: <KeyRound className="feature-icon-svg" />,
      title: "100% Non-Custodial",
      description: "Your keys, your funds. Seamlessly connect Hive Keychain without handing custody to any third party.",
      tag: "True Ownership"
    },
    {
      icon: <Zap className="feature-icon-svg" />,
      title: "Zero Network Gas Fees",
      description: "Experience the speed of the Hive blockchain with zero network gas fees and sub-3-second block finality.",
      tag: "Free Transfers"
    },
    {
      icon: <Coins className="feature-icon-svg" />,
      title: "Transparent, Minimal Fees",
      description: "Enjoy ultra-tight spreads and transparent low fees with zero hidden markups or predatory deductions.",
      tag: "Low Spread"
    },
    {
      icon: <TrendingUp className="feature-icon-svg" />,
      title: "Spend & Earn Cashbacks",
      description: "Spend your HBD on platforms like SpendHBD & Distriator to earn up to 55% cashback rewards.",
      tag: "Real Utility"
    },
    {
      icon: <ShieldCheck className="feature-icon-svg" />,
      title: "Institutional-Grade Safety",
      description: "Enterprise protection protocols, strict encryption, 2FA, and real-time fraud monitoring on every swap.",
      tag: "Bank-Grade"
    }
  ];

  return (
    <section id="features" className="section features modern-features-section">
      <div className="container">
        <div className="section-header scroll-reveal">
          <div className="section-badge-pill">
            <span>Enterprise Architecture</span>
          </div>
          <h2 className="section-title">Why Web3 Traders Choose Ezabay</h2>
          <p className="section-subtitle">
            The bridge between traditional banking and the decentralized Hive economy — built for speed, safety, and everyday spending.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card glass scroll-reveal"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="feature-card-top">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <span className="feature-tag-badge">{feature.tag}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
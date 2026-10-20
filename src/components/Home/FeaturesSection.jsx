import React from 'react';
import { ShieldCheck, Zap, RefreshCw, BarChart3, Coins, Wallet, TrendingUp, ArrowLeftRight } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <ArrowLeftRight className="feature-icon-svg" />,
      title: "Buy HIVE & HBD",
      description: "Quick and secure way to acquire HIVE and HBD with multiple payment options."
    },
    {
      icon: <ShieldCheck className="feature-icon-svg" />,
      title: "Secure Transactions",
      description: "Our platform prioritizes security, ensuring your HIVE and HBD transactions are safe and protected."
    },
    {
      icon: <Coins className="feature-icon-svg" />,
      title: "Low Fees",
      description: "Enjoy trading HIVE and HBD with minimal fees. Our platform ensures transparent pricing."
    },
    {
      icon: <TrendingUp className="feature-icon-svg" />,
      title: "Spend & Earn",
      description: "Use HIVE and HBD on platforms like SpendHBD and Distraitor for payments and rewards."
    }
  ];

  return (
    <section id="features" className="section features">
      <div className="container">
        <div className="section-header scroll-reveal">
          <h2 className="section-title">Why Choose Ezabay?</h2>
          <p className="section-subtitle">The Gateway to Seamless Spending & Rewards</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card glass glass-hover scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
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
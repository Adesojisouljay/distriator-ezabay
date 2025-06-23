import { ArrowLeftRight, ShieldCheck, Coins, TrendingUp } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="scroll-reveal">
          <h2 className="section-title">
            Buy HIVE & HBD with Ease
          </h2>
          <p className="section-subtitle">
            The Gateway to Seamless Spending & Rewards
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card scroll-reveal">
            <div className="feature-icon">
              <ArrowLeftRight size={32} />
            </div>
            <h3 className="feature-title">Quick & Easy HIVE Purchases</h3>
            <p className="feature-description">
              Purchase HIVE and HBD instantly with minimal hassle, ready for use on SpendHBD and Distraitor.
            </p>
          </div>

          <div className="feature-card scroll-reveal">
            <div className="feature-icon">
              <ShieldCheck size={32} />
            </div>
            <h3 className="feature-title">Secure Transactions</h3>
            <p className="feature-description">
              Our platform prioritizes security, ensuring your HIVE and HBD transactions are safe and protected.
            </p>
          </div>

          <div className="feature-card scroll-reveal">
            <div className="feature-icon">
              <Coins size={32} />
            </div>
            <h3 className="feature-title">Low Fees on Transactions</h3>
            <p className="feature-description">
              Enjoy trading HIVE and HBD with minimal fees. Our platform ensures transparent pricing without hidden charges.
            </p>
          </div>

          <div className="feature-card scroll-reveal">
            <div className="feature-icon">
              <TrendingUp size={32} />
            </div>
            <h3 className="feature-title">Spend & Earn with HIVE & HBD</h3>
            <p className="feature-description">
              Use HIVE and HBD on platforms like SpendHBD and Distraitor for payments and rewards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
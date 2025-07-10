import { Shield, Lock, Award } from 'lucide-react';

const SecuritySection = () => {
  return (
    <section id="security" className="security-section">
      <div className="container">
        <div className="security-content">
          <div className="security-text scroll-reveal">
            <h2 className="section-title">Decentralized Security</h2>
            <p className="security-description">
              Your safety is built into the protocol. With non-custodial wallets and Hive blockchain technology, 
              your assets remain in your control — always.
            </p>
            <div className="security-features">
              <div className="security-feature">
                <Lock size={24} />
                <div>
                  <h4>Non-Custodial</h4>
                  <p>Only you hold the keys. No third party can access your funds.</p>
                </div>
              </div>
              <div className="security-feature">
                <Shield size={24} />
                <div>
                  <h4>On-Chain Security</h4>
                  <p>Every transaction is recorded transparently and immutably on Hive.</p>
                </div>
              </div>
              <div className="security-feature">
                <Award size={24} />
                <div>
                  <h4>Community-Governed</h4>
                  <p>Security protocols evolve with input from Hive’s decentralized community.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="security-visual scroll-reveal">
            <div className="security-shield">
              <Shield className="shield-icon animate-pulse" size={120} />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default SecuritySection;
import { Shield, Lock, Award } from 'lucide-react';

const SecuritySection = () => {
  return (
    <section id="security" className="security-section">
      <div className="container">
        <div className="security-content">
          <div className="security-text scroll-reveal">
            <h2 className="section-title">Bank-Level Security</h2>
            <p className="security-description">
              Your security is our top priority. We implement multiple layers of protection 
              to ensure your funds and personal information remain safe at all times.
            </p>
            <div className="security-features">
              <div className="security-feature">
                <Lock size={24} />
                <div>
                  <h4>Cold Storage</h4>
                  <p>95% of funds stored offline in secure cold wallets</p>
                </div>
              </div>
              <div className="security-feature">
                <Shield size={24} />
                <div>
                  <h4>2FA Authentication</h4>
                  <p>Two-factor authentication for enhanced account security</p>
                </div>
              </div>
              <div className="security-feature">
                <Award size={24} />
                <div>
                  <h4>Insurance Coverage</h4>
                  <p>FDIC insured up to $250,000 for digital assets</p>
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
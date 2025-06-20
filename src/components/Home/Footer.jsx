import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content scroll-reveal">
          <h3 className="footer-logo">
            Ezabay
          </h3>
          <p className="footer-description">
            We offer seamless transactions, minimal fees, and access to SpendHBD and Distraitor for payments and rewards.
          </p>
          <div className="footer-cta">
            <Link to="/login" className="btn-primary">Get Started</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            Buying and Selling HIVE and HBD with ease.
            <br />
            Ezabay © 2023. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
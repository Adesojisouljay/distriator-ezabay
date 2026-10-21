import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content scroll-reveal">
          <h3 className="footer-logo">
            Ezabay
          </h3>
          <p className="footer-description">
            We offer seamless transactions, minimal fees, and access to SpendHBD and Distriator for payments and rewards.
          </p>
          <div className="footer-cta">
            <Link to="/login" className="btn-primary">Get Started</Link>
            <a 
              href="https://chat.whatsapp.com/L6xOf8KnRupCWaNpmzvYuJ?mode=gi_t" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp"
            >
              <FaWhatsapp size={18} />
              <span>Join WhatsApp Group</span>
            </a>
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
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const ContactSection = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="scroll-reveal">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">
            Have questions or want to connect with our trading community? We're here 24/7.
          </p>
        </div>
        
        <div className="contact-grid">
          <a 
            href="https://chat.whatsapp.com/L6xOf8KnRupCWaNpmzvYuJ?mode=gi_t" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-item contact-item-whatsapp scroll-reveal"
          >
            <FaWhatsapp className="contact-icon text-whatsapp" size={40} />
            <h3>WhatsApp Community</h3>
            <p>Join our group for live rate alerts, fast support, and P2P updates.</p>
            <span className="contact-badge-btn">Join Group &rarr;</span>
          </a>

          <a href="mailto:support@ezabay.com" className="contact-item scroll-reveal">
            <Mail className="contact-icon" size={40} />
            <h3>Email Support</h3>
            <p>support@ezabay.com</p>
            <span className="contact-badge-btn">Send Email &rarr;</span>
          </a>

          <a href="tel:+2349023210315" className="contact-item scroll-reveal">
            <Phone className="contact-icon" size={40} />
            <h3>Phone Support</h3>
            <p>+234 90232 10315</p>
            <span className="contact-badge-btn">Call Now &rarr;</span>
          </a>

          <div className="contact-item scroll-reveal">
            <MapPin className="contact-icon" size={40} />
            <h3>Office Location</h3>
            <p>105 Glass Street<br />Sagamu City, Ogun state</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
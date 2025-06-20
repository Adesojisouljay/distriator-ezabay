import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSection = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="scroll-reveal">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">
            Have questions? We're here to help 24/7
          </p>
        </div>
        
        <div className="contact-grid">
          <div className="contact-item scroll-reveal">
            <Mail className="contact-icon" size={40} />
            <h3>Email Support</h3>
            <p>support@ezabay.com</p>
          </div>
          <div className="contact-item scroll-reveal">
            <Phone className="contact-icon" size={40} />
            <h3>Phone Support</h3>
            <p>+234 81600 5535</p>
          </div>
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
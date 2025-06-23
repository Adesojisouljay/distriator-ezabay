import { Bitcoin } from 'lucide-react';
// import logo from "../../assets/Ezabay-logo.png"
import logo from "../../assets/Ezabay-logo.png"

const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <a href="#" className="logo">
          <img src={logo} alt="" />
       </a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#security">Security</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#" className="cta-button">Get Started</a>
      </div>
    </nav>
  );
};

export default Navigation;
import React, { useEffect } from 'react';
import './home.css';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isTokenValid } from '../utils';
// import Hero from '../components/Home/Hero';
// import Feature from '../components/Home/Feature';
// import Faq from '../components/Home/Faq';

import Footer from '../components/Home/Footer';
// import { Navigation } from 'lucide-react';
import Navigation from '../components/Home/Navigation';
import HeroSection from '../components/Home/HeroSection';
import ContactSection from '../components/Home/ContactSection';
import FAQSection from '../components/Home/FAQSection';
import AboutSection from '../components/Home/AboutSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import TradingFeatures from '../components/Home/TradingFeatures';
import SecuritySection from '../components/Home/SecuritySection';
import TestimonialsSection from '../components/Home/TestimonialsSection';
import NewsletterSection from '../components/Home/NewsletterSection';
import StatsSection from '../components/Home/StatsSection';
import "../components/Home/style.css"
export const Home = () => {
  const navigate = useNavigate()
  const global = useSelector(state => state)

  // useEffect(() => {
  //   AOS.init({duration:1000});
  //   if(global.ekzaUser.user)
  //   }, [])
  useEffect(() => {
    const token = localStorage.getItem('token');
          
    if (isTokenValid(token)) {
        navigate("/dashboard")
    }
  }, []);



  useEffect(() => {
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    // FAQ toggle functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(otherItem => otherItem.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);
  
  return (
    // <div className="home-wrap">
    // <Hero />
    // <Feature />
    // {/* <Stunt /> */}
    // <Faq />
    // <Footer />
    // </div>
    <div className="home-wrap">
      {/* <Navigation /> */}
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <FeaturesSection />
      <TradingFeatures />
      <SecuritySection />
      <TestimonialsSection />
      <NewsletterSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>


    
  );
};


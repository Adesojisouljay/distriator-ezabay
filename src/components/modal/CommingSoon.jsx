import React from 'react';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi2';
import { RiRocketLine } from 'react-icons/ri';
import './coming-soon.scss';

export const ComingSoon = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal coming-soon-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose} type="button" title="Close">
          <IoClose size={18} />
        </button>

        <div className="coming-soon-content">
          <div className="icon-glow-badge">
            <RiRocketLine size={36} className="rocket-icon" />
            <HiSparkles size={18} className="sparkle-icon" />
          </div>

          <div className="coming-soon-header">
            <h3>Exciting Features Cooking!</h3>
            <p className="cs-desc">
              We are actively developing next-generation financial tools for your Ezabay account.
            </p>
          </div>

          <div className="feature-teaser-grid">
            <div className="teaser-pill">
              <span className="dot emerald" />
              <span>Automated Bill Payments</span>
            </div>
            <div className="teaser-pill">
              <span className="dot cyan" />
              <span>Virtual Dollar Cards</span>
            </div>
            <div className="teaser-pill">
              <span className="dot amber" />
              <span>Multi-Currency Swaps</span>
            </div>
            <div className="teaser-pill">
              <span className="dot purple" />
              <span>Merchant POS API</span>
            </div>
          </div>

          <button onClick={onClose} className="fiat-primary-btn cs-btn" type="button">
            Awesome, Keep Me Posted!
          </button>
        </div>
      </div>
    </div>
  );
};

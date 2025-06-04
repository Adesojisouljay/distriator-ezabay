import React from 'react';
import './fiat-deposit.scss';

export const ComingSoon = ({ isOpen, onClose }) => {

  return (
    <div className={`fadded-container modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`modal-overlay  ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
      <div className="modal f-d-modal-start ">
        <div className="fiat-d-modal-content">
         
            <>
              <div className="bank-peer-wrap">
              <div className="deposit-head-text-wrap">
                <h3>Hey there, thanks for stopping by! 👋✨</h3>
                <p className="warning">🚀 We’re cooking up some exciting features — they’ll be live on Ezabay very soon!💡</p>
                </div>

                <button onClick={onClose} className="done-transfer-btn">
                🙌 Awesome, I’ll check back later!
                </button>

              </div>
            </>
        </div>
      </div>
    </div>
  );
}

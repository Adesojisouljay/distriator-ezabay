import React from 'react';
import { IoClose } from 'react-icons/io5';
import { HiPaperAirplane, HiGlobeAlt } from 'react-icons/hi2';
import './deposit-modal.scss';
import './sendOptions.scss';

export const SendOptions = ({ isOpen, onClose, openOnchain, internalOpen }) => {
  const openOnchainModal = () => {
    openOnchain();
    onClose();
  };

  const openInternalModal = () => {
    internalOpen();
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal">
        <button className="close-modal" onClick={onClose} title="Close">
          <IoClose size={18} />
        </button>

        <div className="send-options-container">
          <h2>Select Send Option</h2>
          <span className="options-sub">Choose how you want to transfer your assets</span>

          <div className="options-wrapper">
            <div className="options-picker" onClick={openInternalModal}>
              <div className="picker-icon-wrap">
                <HiPaperAirplane size={20} />
              </div>
              <div className="picker-content">
                <div className="picker-title-row">
                  <h4>Internal Transfer</h4>
                  <span className="tag-free">Instant &bull; 0 Fee</span>
                </div>
                <p>Transfer instantly to another Ezabay user using their username. No blockchain gas fees.</p>
              </div>
            </div>

            <div className="options-picker" onClick={openOnchainModal}>
              <div className="picker-icon-wrap">
                <HiGlobeAlt size={20} />
              </div>
              <div className="picker-content">
                <div className="picker-title-row">
                  <h4>On-Chain Withdrawal</h4>
                  <span className="tag-free">External Wallet</span>
                </div>
                <p>Withdraw crypto directly to any external blockchain address or exchange.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SendOptions;

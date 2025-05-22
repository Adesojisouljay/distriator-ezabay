import React from 'react';
import "./fiatransfer.scss"; ////should be removed when modal styles are properly added to sendOptions.scss////
import "./sendOptions.scss";

export const SendOptions = ({ isOpen, onClose, openOnchain, internalOpen }) => {

    const openOnchainModal = () => {
        openOnchain()
        onClose()
    }
    const openInternalModal = () => {
      internalOpen()
        onClose()
    }
 
  return (
    <div className={`f-t-modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`f-t-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
      <div className="f-t-modal">
        <span className="close-modal" onClick={onClose}>X</span>
        <div className="send-options-container">
          <h2>Select withdrawal option</h2>
          <div className="options-wrapper">
            <div className="options-picker" 
                onClick={openInternalModal}
            >
                <p>Click this option to make a withdrawal to an Ezabay user</p>
                <span className='picker-info'>Recommened for withdrawals within Ezabay</span>
            </div>
            <div className="options-picker" onClick={openOnchainModal}>
                <p>Click this option to make onchain withdrawal</p>
                <span className='picker-info'>Recommened for onchain withdrawals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

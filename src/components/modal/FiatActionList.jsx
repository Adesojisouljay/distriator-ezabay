import React from 'react'
import moment from 'moment';


function FiatActionList({onClose, isOpen, deposit, handleConfirmDeposit, handleCancelDeposit }) {
    const createdAt = "2024-12-11T04:54:38.647Z";
   const formattedTime = moment(deposit.createdAt).fromNow();
  return (
    <div>
        <div className={`fadded-container modal-overlay ${isOpen ? 'open' : ''}`} >
      <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>

      <div className="modal testing">
        <span className="close-modal" onClick={onClose}>X</span>

        <div className="trx-list-container">
          <h2>Verify Details</h2>
          <ul>
          <li><strong>Amount:</strong> {deposit.amount}</li>
          <li><strong>Narration:</strong> {deposit.narration}</li>
          <li><strong>Email:</strong> {deposit.user.email}</li>
          <li><strong>Amount:</strong> {deposit.amount}</li>
          <li><strong>Status:</strong> {deposit.status}</li>
          {deposit.status === 'pending' &&  <li><strong>OrderTime:</strong> {formattedTime}</li>}

          <li><strong>Merchant Username:</strong> {deposit?.merchantUsername?.username}</li>
          </ul>
          {deposit.status === 'pending' && (
            <>
            <button
              className="confirm-btn"
              onClick={() => handleConfirmDeposit(deposit._id)}
            >
              Confirm
            </button>
            <button
              className="cancel-btn"
              onClick={() => handleCancelDeposit(deposit._id)}
            >
              Cancel
            </button>
          </>
         )}             

          
        </div>
      </div>
    </div>

    </div>
  )
}

export default FiatActionList
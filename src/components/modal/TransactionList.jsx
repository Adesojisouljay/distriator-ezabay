import React from 'react';
import { IoClose } from 'react-icons/io5';
import "./TransactionList.scss";

function TransactionList({ isOpen, onClose, trxListData: data }) {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal testing" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose} type="button" title="Close">
          <IoClose size={18} />
        </button>

        <div className="trx-list-container">
          <h2>Transaction Details</h2>

          {data ? (
            <ul className="trx-list-details">
              {data?.amount && <li><strong>Amount:</strong> {data.amount}</li>}
              {data?.currency && <li><strong>Currency:</strong> {data.currency}</li>}
              {data?.type && <li><strong>Type:</strong> {data.type}</li>}
              {data?.status && <li><strong>Status:</strong> {data.status}</li>}
              {data?.sender && <li><strong>Sender:</strong> {data.sender}</li>}
              {data?.receiver && <li><strong>Receiver:</strong> {data.receiver}</li>}
              {data?.memo && <li><strong>Memo:</strong> {data.memo}</li>}
              {data?.timestamp && <li><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</li>}

              {data?.bankDetails && (
                <>
                  <h3>Bank Details</h3>
                  {data?.bankDetails?.bankName && <li><strong>Bank Name:</strong> {data.bankDetails.bankName}</li>}
                  {data?.bankDetails?.accountNumber && <li><strong>Account Number:</strong> {data.bankDetails.accountNumber}</li>}
                </>
              )}

              {data?.trxId && <li><strong>Transaction ID:</strong> {data.trxId}</li>}
            </ul>
          ) : (
            <p>No transaction data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionList;

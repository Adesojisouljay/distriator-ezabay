import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { fiatTransfer } from '../../api/ekzat';
import { getUserProfile, getReceiverProfile } from '../../api/profile';
import { Loader } from '../loader/Loader';
import "./fiatransfer.scss";

export const FiatTransferModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [loading, setLoading] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const debounceTimeout = useRef(null); // Store timeout reference

  const notAllowed = loading || !receiver || !amount;

  useEffect(() => {
    if (!receiver) {
      setReceiverInfo(null);
      return;
    }

    // Clear the previous timeout if the user is still typing
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // Set a new timeout to fetch data after the user stops typing
    debounceTimeout.current = setTimeout(() => {
      getReceiver();
    }, 1000); // 1-second debounce delay

    return () => clearTimeout(debounceTimeout.current); // Cleanup on unmount
  }, [receiver]);

  const getReceiver = async () => {
    setLoading(true);
    try {
      const data = await getReceiverProfile(receiver);
      console.log("Receiver data:", data);
      setReceiverInfo(data);
    } catch (error) {
      setReceiverInfo(null);
      toast.error(error.message, {
        style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiatTransfer = async () => {
    setLoading(true);
    try {
      await fiatTransfer({ receiverIdentifier: receiver, amount });
      toast.success(`Fiat transfer to ${receiver} successful`, {
        style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
      });
      onClose();
      getUserProfile(dispatch);
    } catch (error) {
      toast.error(error.message, {
        style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`f-t-modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`f-t-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
      <div className="f-t-modal">
        <span className="close-modal" onClick={onClose}>X</span>
        <div className="fiattransfer-container">
          <h2>Transfer Fiat</h2>
          {loading && <Loader />}
          <div className="ftr-input-group">
            <label htmlFor="receiver">Receiver</label>
            <input
              style={{ color: "white" }}
              type="text"
              id="receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Enter recipient"
            />
            {receiverInfo && (
              <div>
                <h4>Transferring to {receiverInfo?.firstName} {receiverInfo?.lastName}</h4>
              </div>
            )}
            <label htmlFor="transfer-amount">Amount</label>
            <input
              style={{ color: "white" }}
              type="number"
              id="transfer-amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>
          <button
            style={{ cursor: notAllowed ? "not-allowed" : "pointer" }}
            disabled={notAllowed}
            className="deposit-btn"
            onClick={handleFiatTransfer}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

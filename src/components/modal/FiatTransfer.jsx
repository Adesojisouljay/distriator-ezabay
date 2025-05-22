import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { fiatTransfer, requestToken } from '../../api/ekzat';
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

  ////////////////
  const [withdrawalToken, setWithdrawalToken] = useState("");
  const [requestedToken, setRequestedToken] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

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

  useEffect(() => {
    let timer;
    if (tokenExpiry && isOpen) {
      timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((tokenExpiry - now) / 1000));
        setTimeRemaining(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tokenExpiry, isOpen]);

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

  const handleRequestToken = async () => {
    if (!amount) {
      toast.error("Please enter a withdrawal amount.", {
        style: {
          backgroundColor: "rgba(229, 229, 229, 0.1)",
          color: "#fff",
          fontSize: "16px",
          marginTop: "60px",
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await requestToken();
      if (response.success) {
        toast.success("Withdrawal token sent to your email", {
          style: {
            backgroundColor: "rgba(229, 229, 229, 0.1)",
            color: "#fff",
            fontSize: "16px",
            marginTop: "60px",
          },
        });
        setRequestedToken(true);
        const expiryTime = Date.now() + 15 * 60 * 1000;
        setTokenExpiry(expiryTime);
        setTimeRemaining(15 * 60);
      } else {
        toast.error(response.message || "Failed to request withdrawal token", {
          style: {
            backgroundColor: "rgba(229, 229, 229, 0.1)",
            color: "#fff",
            fontSize: "16px",
            marginTop: "60px",
          },
        });
      }
    } catch (error) {
      toast.error("Failed to request withdrawal token", {
        style: {
          backgroundColor: "rgba(229, 229, 229, 0.1)",
          color: "#fff",
          fontSize: "16px",
          marginTop: "60px",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`f-t-modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`f-t-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
      <div className="f-t-modal">
        <span className="close-modal" onClick={onClose}>X</span>
       {!requestedToken ? <div className="fiattransfer-container">
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
            onClick={handleRequestToken}
          >
            Proceed(requested token)
          </button>
        </div> :
        <div className='fiat-transfer-token'>
          <div className="withdrawal-token">
            <label htmlFor="token">Withdrawal Token:</label>
            <input
              className="withrawal-amount-input"
              id="token"
              type="text"
              value={withdrawalToken}
              onChange={(e) => setWithdrawalToken(e.target.value)}
              required
            />
            <span className="check-email-token">
              Check email for Withdrawal token.
            </span>
          </div>
          <div className="token-info">
            {timeRemaining > 0 && (
              <p>
                Token expires in {Math.floor(timeRemaining / 60)}:
                {timeRemaining % 60} minutes
              </p>
            )}
            {timeRemaining === 0 && (
              <button
                className="resend-token-btn"
                onClick={handleRequestToken}
                disabled={isLoading || !amount}
              >
                {isLoading
                  ? "Requesting Token..."
                  : "Request New Token"}
              </button>
            )}
          </div>
          <button
            className="submit-btn"
            onClick={handleFiatTransfer}
            disabled={
              isLoading ||
              !withdrawalToken ||
              !amount
            }
          >
            {isLoading
              ? "Processing Withdrawal..."
              : "Submit Withdrawal"}
          </button>
        </div>}
      </div>
    </div>
  );
};

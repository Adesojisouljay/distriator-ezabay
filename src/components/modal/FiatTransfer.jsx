import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { IoClose } from 'react-icons/io5';
import { LuBadgeInfo, LuUserCheck } from "react-icons/lu";
import { ShieldCheck, Mail } from "lucide-react";
import { fiatTransfer, requestToken, getWithdrawalKeychainChallenge } from '../../api/ekzat';
import { getUserProfile, getReceiverProfile } from '../../api/profile';
import { Loader } from '../loader/Loader';
import Spinner from '../spinner/Spinner';
import "./fiatransfer.scss";

export const FiatTransferModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.ekzaUser?.user);
  const isKeychainInstalled = typeof window !== 'undefined' && !!window.hive_keychain;

  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [authMethod, setAuthMethod] = useState(isKeychainInstalled ? 'keychain' : 'email');
  const [hiveUsernameInput, setHiveUsernameInput] = useState(user?.hiveUsername || '');
  const [loading, setLoading] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const debounceTimeout = useRef(null);

  const [withdrawalToken, setWithdrawalToken] = useState("");
  const [requestedToken, setRequestedToken] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (user?.hiveUsername) {
      setHiveUsernameInput(user.hiveUsername);
    }
  }, [user]);

  useEffect(() => {
    if (!receiver) {
      setReceiverInfo(null);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      getReceiver();
    }, 800);

    return () => clearTimeout(debounceTimeout.current);
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

  if (!isOpen) return null;

  const nairaBalance = user?.nairaBalance != null ? Number(user.nairaBalance).toFixed(2) : "0.00";
  const notAllowed = loading || isLoading || !receiver || !amount || Number(amount) <= 0;

  const getReceiver = async () => {
    setLoading(true);
    try {
      const data = await getReceiverProfile(receiver);
      setReceiverInfo(data);
    } catch (error) {
      setReceiverInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeychainTransfer = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return;
    }
    if (Number(amount) > Number(nairaBalance)) {
      toast.error("Transfer amount exceeds available cash balance.");
      return;
    }
    if (!receiver) {
      toast.error("Please enter a recipient username or email.");
      return;
    }

    const cleanHiveUser = (user?.hiveUsername || hiveUsernameInput || '').trim().replace(/^@/, '').toLowerCase();
    if (!cleanHiveUser) {
      toast.error("Please enter your Hive username to sign with Keychain.");
      return;
    }

    if (!window.hive_keychain) {
      toast.error("Hive Keychain extension not detected. Please install Keychain or switch to Email Code.");
      return;
    }

    setIsLoading(true);

    try {
      const challengeRes = await getWithdrawalKeychainChallenge({
        amount,
        currency: 'NGN',
        to: receiver,
        action: 'fiat-transfer',
        username: cleanHiveUser,
      });

      if (!challengeRes?.success || !challengeRes?.challenge) {
        throw new Error(challengeRes?.message || "Failed to generate Keychain authorization challenge.");
      }

      window.hive_keychain.requestSignBuffer(
        cleanHiveUser,
        challengeRes.challenge,
        'Posting',
        async (keychainResponse) => {
          if (!keychainResponse || !keychainResponse.success) {
            setIsLoading(false);
            toast.error(keychainResponse?.message || "Keychain signature cancelled or failed.");
            return;
          }

          try {
            await fiatTransfer({
              receiverIdentifier: receiver,
              amount,
              authMethod: 'keychain',
              keychainSignature: keychainResponse.result,
              keychainChallenge: challengeRes.challenge,
              hiveUsername: cleanHiveUser,
            });

            toast.success(`Fiat transfer of ₦${Number(amount).toLocaleString()} to ${receiver} successful!`);
            getUserProfile(dispatch);
            handleClose();
          } catch (apiErr) {
            console.error(apiErr);
            toast.error(apiErr.message || "Fiat transfer failed.");
          } finally {
            setIsLoading(false);
          }
        }
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error preparing Keychain signing.");
      setIsLoading(false);
    }
  };

  const handleFiatTransfer = async () => {
    if (!withdrawalToken) {
      toast.error("Please enter the verification code sent to your email.");
      return;
    }
    setIsLoading(true);
    try {
      await fiatTransfer({
        receiverIdentifier: receiver,
        amount,
        authMethod: 'email',
        withdrawalToken,
      });
      toast.success(`Fiat transfer to ${receiver} successful!`);
      getUserProfile(dispatch);
      handleClose();
    } catch (error) {
      toast.error(error.message || "Fiat transfer failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestToken = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return;
    }
    if (Number(amount) > Number(nairaBalance)) {
      toast.error("Transfer amount exceeds available cash balance.");
      return;
    }
    if (!receiver) {
      toast.error("Please enter a recipient username or email.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await requestToken();
      if (response.success) {
        toast.success("Security token sent to your email.");
        setRequestedToken(true);
        const expiryTime = Date.now() + 15 * 60 * 1000;
        setTokenExpiry(expiryTime);
        setTimeRemaining(15 * 60);
      } else {
        toast.error(response.message || "Failed to request token.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to request token.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setReceiver("");
    setReceiverInfo(null);
    setWithdrawalToken("");
    setRequestedToken(false);
    setTokenExpiry(null);
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className="modal fiat-transfer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={handleClose} type="button" title="Close">
          <IoClose size={18} />
        </button>

        {loading && <Loader />}

        <div className="fiat-modal-body">
          <div className="modal-title-wrap">
            <h3>Fiat Transfer (P2P)</h3>
            <p className="modal-subtitle">Instant internal transfer to any Ezabay account holder with zero fees</p>
          </div>

          {!requestedToken ? (
            <div className="transfer-form-step">
              {/* Auth Method Selector */}
              <div className="auth-method-selector">
                <button
                  type="button"
                  className={`auth-method-btn ${authMethod === 'keychain' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('keychain')}
                >
                  <ShieldCheck size={15} /> Hive Keychain (1-Click)
                </button>
                <button
                  type="button"
                  className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('email')}
                >
                  <Mail size={15} /> Email Code
                </button>
              </div>

              {authMethod === 'keychain' && !isKeychainInstalled && (
                <div className="keychain-badge-warning">
                  <span>Keychain extension not detected. Switch to Email Code or install Hive Keychain.</span>
                </div>
              )}

              {authMethod === 'keychain' && user?.hiveUsername && (
                <div className="keychain-badge-info">
                  <span>Authorizing with linked Hive account: <strong>@{user.hiveUsername}</strong></span>
                </div>
              )}

              {authMethod === 'keychain' && !user?.hiveUsername && (
                <div className="fiat-input-section" style={{ marginBottom: '4px' }}>
                  <label className="field-label" htmlFor="hive-username-transfer">Hive Username (for Keychain signature):</label>
                  <div className="amount-input-card">
                    <input
                      id="hive-username-transfer"
                      type="text"
                      placeholder="e.g. yourhiveaccount"
                      value={hiveUsernameInput}
                      onChange={(e) => setHiveUsernameInput(e.target.value.trim().toLowerCase())}
                      className="fiat-text-input"
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                    Your Hive account will be securely linked to your Ezabay profile upon confirmation.
                  </span>
                </div>
              )}

              {/* Recipient Input */}
              <div className="fiat-input-section">
                <label className="field-label" htmlFor="receiver">Recipient Username or Email</label>
                <div className="amount-input-card">
                  <input
                    type="text"
                    id="receiver"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="e.g. johndoe"
                    className="fiat-text-input"
                    autoFocus
                  />
                </div>

                {receiverInfo && (
                  <div className="recipient-verified-card">
                    <LuUserCheck size={18} className="verified-icon" />
                    <span>
                      Transferring to: <strong>{receiverInfo?.firstName} {receiverInfo?.lastName}</strong> ({receiverInfo?.username || receiver})
                    </span>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="fiat-input-section">
                <div className="label-balance-row">
                  <label className="field-label" htmlFor="transfer-amount">Transfer Amount</label>
                  <div className="balance-indicator">
                    <span>Cash: ₦{Number(nairaBalance).toLocaleString()}</span>
                    <button
                      type="button"
                      className="max-pill"
                      onClick={() => setAmount(nairaBalance)}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="amount-input-card">
                  <input
                    type="number"
                    id="transfer-amount"
                    value={amount}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9.]/g, "");
                      if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);
                      setAmount(val);
                    }}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                    }}
                    placeholder="Enter amount (₦)"
                    className="fiat-amount-input"
                    min="0"
                    step="any"
                  />
                </div>
              </div>

              <div className="deposit-info-banner">
                <LuBadgeInfo size={18} className="info-icon" />
                <span>Zero transaction fees. Funds reflect immediately in recipient's wallet balance.</span>
              </div>

              <button
                disabled={notAllowed || isLoading}
                className={`fiat-primary-btn ${notAllowed ? 'disabled' : ''}`}
                onClick={authMethod === 'keychain' ? handleKeychainTransfer : handleRequestToken}
                type="button"
              >
                {isLoading ? (
                  <Spinner />
                ) : authMethod === 'keychain' ? (
                  "Sign & Transfer with Keychain"
                ) : (
                  "Proceed to Verification"
                )}
              </button>
            </div>
          ) : (
            <div className="token-verification-step">
              <div className="token-alert-banner">
                <LuBadgeInfo size={20} className="info-icon" />
                <p>A verification code was sent to your email to authorize sending <strong>₦{Number(amount).toLocaleString()}</strong> to <strong>{receiver}</strong>.</p>
              </div>

              <div className="fiat-input-section">
                <label className="field-label">Verification Code</label>
                <div className="amount-input-card">
                  <input
                    className="fiat-amount-input token-input"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={withdrawalToken}
                    onChange={(e) => setWithdrawalToken(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="token-timer-block">
                {timeRemaining > 0 ? (
                  <span className="timer-text">
                    Code expires in <strong>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</strong>
                  </span>
                ) : (
                  <button
                    className="resend-token-link"
                    onClick={handleRequestToken}
                    disabled={isLoading}
                    type="button"
                  >
                    Code expired. Request new code
                  </button>
                )}
              </div>

              <div className="button-actions-wrap">
                <button
                  className="fiat-primary-btn"
                  onClick={handleFiatTransfer}
                  disabled={isLoading || !withdrawalToken}
                  type="button"
                >
                  {isLoading ? "Processing Transfer..." : "Confirm & Send Funds"}
                </button>
                <button
                  className="fiat-secondary-btn"
                  onClick={() => setRequestedToken(false)}
                  type="button"
                >
                  Back to Edit Transfer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

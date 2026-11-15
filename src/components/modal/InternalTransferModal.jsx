import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { requestToken, internalTransfer, getWithdrawalKeychainChallenge } from '../../api/ekzat';
import { RiArrowDownSFill } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { ShieldCheck, Mail } from 'lucide-react';
import { Dropdown } from '../dropdown/Dropdown';
import './withdraw-modal.scss';
import Spinner from '../spinner/Spinner';
import { getReceiverProfile, getUserProfile } from '../../api/profile';
import { Loader } from '../loader/Loader';

export const InternalTransferModal = ({ isOpen, onClose, assets, user }) => {
  const dispatch = useDispatch();
  const isKeychainInstalled = typeof window !== 'undefined' && !!window.hive_keychain;

  const [memo, setMemo] = useState('');
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [authMethod, setAuthMethod] = useState(isKeychainInstalled ? 'keychain' : 'email');
  const [hiveUsernameInput, setHiveUsernameInput] = useState(user?.hiveUsername || '');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [disableBtn, setDisableBtn] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [disableBtn2, setDisableBtn2] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const debounceTimeout = useRef(null);

  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [openList, setOpenList] = useState(false);
  const [displaySearch, setDisplaySearch] = useState(false);

  useEffect(() => {
    if (user?.hiveUsername) {
      setHiveUsernameInput(user.hiveUsername);
    }
  }, [user]);

  const getUnitPriceUsd = (asset) => {
    if (!asset) return 0;
    if (asset.usdValue && Number(asset.usdValue) > 0) return Number(asset.usdValue);
    if (asset.balance && asset.asseUsdtWorth && Number(asset.balance) > 0) {
      return Number(asset.asseUsdtWorth) / Number(asset.balance);
    }
    return 0;
  };

  const formatCryptoAmount = (val, maxDecimals = 8) => {
    if (val === null || val === undefined || isNaN(val)) return '0';
    const num = Number(val);
    if (num === 0) return '0';
    const fixed = num.toFixed(maxDecimals);
    return parseFloat(fixed).toString();
  };

  const unitPrice = getUnitPriceUsd(selectedAsset);
  const availBalanceFormatted = formatCryptoAmount(selectedAsset?.balance, selectedAsset?.currency === 'bitcoin' ? 8 : 4);
  const availBalanceUsd = (Number(selectedAsset?.balance || 0) * unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountUsd = (Number(amount || 0) * unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    if (!receiver) {
      setReceiverInfo(null);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      getReceiver();
    }, 1000);

    return () => clearTimeout(debounceTimeout.current);
  }, [receiver]);

  const handleKeychainTransfer = async () => {
    if (!amount || !receiver || receiverInfo === null) {
      setMessage("Both Receiver and Amount fields are required");
      return;
    }

    const cleanHiveUser = (user?.hiveUsername || hiveUsernameInput || '').trim().replace(/^@/, '').toLowerCase();
    if (!cleanHiveUser) {
      setMessage("Please enter your Hive username to authorize with Keychain");
      return;
    }

    if (!window.hive_keychain) {
      setMessage("Hive Keychain extension not detected in this browser. Please install Keychain or switch to Email Code.");
      return;
    }

    setDisableBtn(true);
    setSpinner(true);
    setMessage("");

    try {
      const challengeRes = await getWithdrawalKeychainChallenge({
        amount,
        currency: selectedAsset?.currency,
        to: receiver,
        action: 'internal-transfer',
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
            setDisableBtn(false);
            setSpinner(false);
            setMessage(keychainResponse?.message || "Keychain signature cancelled or failed.");
            return;
          }

          try {
            const transferData = {
              to: receiver,
              amount: Number(amount),
              currency: selectedAsset?.currency,
              memo,
              authMethod: 'keychain',
              keychainSignature: keychainResponse.result,
              keychainChallenge: challengeRes.challenge,
              hiveUsername: cleanHiveUser,
            };

            await internalTransfer(transferData);

            toast.success(`${selectedAsset?.currency} transfer to ${receiver} successful`, {
              style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
            });
            onClose();
            getUserProfile(dispatch);
          } catch (apiError) {
            console.error('Transfer failed:', apiError);
            setMessage(apiError?.message || "Transfer failed");
            toast.error(apiError?.message || "Transfer failed", {
              style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
            });
          } finally {
            setDisableBtn(false);
            setSpinner(false);
          }
        }
      );
    } catch (err) {
      console.error('Keychain Challenge Error:', err);
      setMessage(err?.message || "Error preparing Keychain signing.");
      setDisableBtn(false);
      setSpinner(false);
    }
  };

  const getToken = async () => {
    setDisableBtn(true);
    setSpinner(true);
    
    if (!amount || !receiver || receiverInfo === null) {
      setMessage("Both Receiver and Amount fields are required");
      setDisableBtn(true);
      setSpinner(false);
      return; 
    }

    setMessage("");

    try {
      const data = await requestToken();
      if (data?.success === true) {
        setStep(2);
      } else {
        setMessage(data?.message || "Failed to send email verification token");
      }
    } catch (error) {
      console.log(error);
      setMessage(error?.message || "Failed to send email verification token");
    } finally {
      setDisableBtn(false);
      setSpinner(false);
    }
  };

  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

  const getReceiver = async () => {
    setLoading(true);
    try {
      const data = await getReceiverProfile(receiver);
      if (!data) {
        setDisableBtn(true);
        setReceiverInfo(null);
        return;
      }
      setReceiverInfo(data);
      setDisableBtn(false);
    } catch (error) {
      setDisableBtn(true);
      setReceiverInfo(null);
      toast.error(error.message, {
        style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setDisableBtn2(true);
    try {
      await internalTransfer({
        to: receiver,
        amount: Number(amount),
        currency: selectedAsset?.currency,
        memo,
        authMethod: 'email',
        withdrawalToken,
      });

      toast.success(`${selectedAsset?.currency} transfer to ${receiver} successful`, {
        style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
      });
      onClose();
      getUserProfile(dispatch);
    } catch (error) {
      console.error('Transfer failed:', error.message);
      toast.error(error.message, {
        style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
      });
    } finally {
      setDisableBtn2(false);
    }
  };
      
  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal testing" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose} title="Close">
          <IoClose size={18} />
        </button>
        <h2 className='w-header'>Internal Transfer</h2>
        {loading && <Loader />}
        {message && <p className='warning'>{message}</p>}

        {step === 1 && (
          <div className="w-input-group">
            {/* Dual Authorization Method Selector */}
            <div className="auth-method-selector">
              <button
                type="button"
                className={`auth-method-btn ${authMethod === 'keychain' ? 'active' : ''}`}
                onClick={() => { setAuthMethod('keychain'); setMessage(''); }}
              >
                <ShieldCheck size={15} /> Hive Keychain (1-Click)
              </button>
              <button
                type="button"
                className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => { setAuthMethod('email'); setMessage(''); }}
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
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="hive-username-transfer">Hive Username (for Keychain signature):</label>
                <input
                  className='w-input'
                  type="text"
                  placeholder="e.g. yourhiveaccount"
                  value={hiveUsernameInput}
                  onChange={(e) => setHiveUsernameInput(e.target.value.trim().toLowerCase())}
                  id="hive-username-transfer"
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', marginTop: '2px', display: 'block' }}>
                  Your Hive account will be securely linked to your Ezabay profile upon confirmation.
                </span>
              </div>
            )}

            <div className='w-main'>
              <div className='d-coin-select-wrapper'>
                <span className="label-tag">Select Asset</span>
                <div className="d-currency-select-wrap" onClick={handleOpencoinList}>
                  {selectedAsset?.image && <img className="d-coin-wrap" src={selectedAsset?.image} alt="" />}
                  <span className='d-picker-currency'>{selectedAsset?.symbol || selectedAsset?.currency}</span>
                  <RiArrowDownSFill size={20}/>
                </div>
                <Dropdown 
                  user={user}
                  setCurrency={setSelectedAsset}
                  handleOpencoinList={handleOpencoinList} 
                  openList={openList}
                  displaySearch={displaySearch}
                  selectedCurrency={selectedAsset}
                />
              </div>
            </div>

            <div className="w-input-group">
              <label htmlFor="recipient-account">Recipient username/email:</label>
              <input
                className='w-input'
                type="text"
                placeholder="Recipient Address / Username"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                id="recipient-account"
              />
            </div>

            {receiverInfo && (
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ color: 'var(--accent-green, #10b981)', fontSize: '13px' }}>
                  Transferring to: {receiverInfo?.firstName} {receiverInfo?.lastName} (@{receiverInfo?.username})
                </h4>
              </div>
            )}

            <div className="w-A-input-group">
              <label htmlFor="withdraw-amount">Amount:</label>
              <div className="wrap-input">
                <input
                  className='w-input'
                  type="number"
                  id="withdraw-amount"
                  min="0"
                  step="any"
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                  }}
                  value={amount}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9.]/g, '');
                    if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);
                    setDisableBtn(!val);
                    setAmount(val);
                  }}              
                  placeholder="Enter amount"
                />
                {Number(amount) > 0 && unitPrice > 0 && (
                  <span style={{ fontSize: "12px", color: "var(--text-muted, #94a3b8)", marginRight: "8px", whiteSpace: "nowrap" }}>
                    ≈ ${amountUsd}
                  </span>
                )}
                <div className="max-wrap">
                  <span onClick={() => setAmount(selectedAsset.balance)}>Max</span>
                </div>
              </div>
              
              <div className="wrap">
                <span>
                  Available Balance: {availBalanceFormatted}{" "}
                  {unitPrice > 0 && <span style={{ color: "var(--accent-green, #10b981)", marginLeft: "4px" }}>(${availBalanceUsd})</span>}
                </span>
              </div>
            </div>
            
            <label htmlFor="memo">Memo/Note:</label>
            <input
              className='w-input'
              type="text"
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e?.target?.value)}
              placeholder="Enter memo (optional)"
            />
                
            <button
              className="withdraw-btn"
              onClick={authMethod === 'keychain' ? handleKeychainTransfer : getToken}
              disabled={disableBtn}
            >
              {spinner ? (
                <Spinner />
              ) : authMethod === 'keychain' ? (
                "Sign & Transfer with Keychain"
              ) : (
                "Proceed to Email Code"
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="withdrawalToken">Enter 6-Digit Email Token</label>
              <span
                style={{ fontSize: '11px', color: 'var(--accent-green, #10b981)', cursor: 'pointer' }}
                onClick={() => setStep(1)}
              >
                ← Back
              </span>
            </div>
            <input
              className='w-input'
              type="text"
              id="withdrawalToken"
              value={withdrawalToken}
              onChange={(e) => setWithdrawalToken(e.target.value.trim())}
              placeholder="Enter withdrawal token"
            />
            <div className="checktoken">Check email for your 6-digit withdrawal token.</div>
            <button 
              className="withdraw-btn" 
              disabled={disableBtn2 || !withdrawalToken} 
              onClick={handleTransfer}
            >
              {disableBtn2 ? <Spinner /> : "Confirm Transfer"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>✅</div>
            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Transfer Completed</h4>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px', marginBottom: '20px' }}>
              Your internal transfer has been processed successfully.
            </p>
            <button className="withdraw-btn" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

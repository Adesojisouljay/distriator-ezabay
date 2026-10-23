import React, { useState, useEffect } from 'react';
import { processHiveWithdrawal, requestToken, processCryptoWithdrawal, getTransactionFees, getWithdrawalKeychainChallenge } from '../../api/ekzat';
import { RiArrowDownSFill } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { ShieldCheck, Mail } from 'lucide-react';
import { Dropdown } from '../dropdown/Dropdown';
import './withdraw-modal.scss';
import Spinner from '../spinner/Spinner';

export const WithdrawalModal = ({ isOpen, onClose, assets, user }) => {
  const isKeychainInstalled = typeof window !== 'undefined' && !!window.hive_keychain;

  const [memo, setMemo] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [authMethod, setAuthMethod] = useState(isKeychainInstalled ? 'keychain' : 'email');
  const [hiveUsernameInput, setHiveUsernameInput] = useState(user?.hiveUsername || '');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [fee, setFee] = useState(0.000);
  const [disableBtn, setDisableBtn] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [disableBtn2, setDisableBtn2] = useState(false);

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
  const feeFormatted = formatCryptoAmount(fee, selectedAsset?.currency === 'bitcoin' ? 8 : 4);
  const feeUsd = (Number(fee || 0) * unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountUsd = (Number(amount || 0) * unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  useEffect(() => {
    handleGetFees(selectedAsset?.currency);
  }, [selectedAsset]);

  const handleKeychainWithdrawal = async () => {
    if (!amount || !to) {
      setMessage("Both Recipient Address and Amount fields are required");
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
        currency: selectedAsset.currency,
        to,
        action: 'withdrawal',
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
            const withdrawalData = {
              to,
              amount: Number(amount),
              currency: selectedAsset.currency,
              memo,
              authMethod: 'keychain',
              keychainSignature: keychainResponse.result,
              keychainChallenge: challengeRes.challenge,
              hiveUsername: cleanHiveUser,
            };

            let result;
            if (selectedAsset.currency === "hive" || selectedAsset.currency === "hive_dollar" || selectedAsset.currency === "hbd") {
              result = await processHiveWithdrawal(withdrawalData);
            } else {
              result = await processCryptoWithdrawal(withdrawalData);
            }

            setMessage(result?.message || "Withdrawal processed successfully");
            setStep(3);
          } catch (apiError) {
            console.error('Withdrawal API error:', apiError);
            setMessage(apiError?.message || "Withdrawal failed");
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

  const handleGeneralWithdrawal = async () => {
    setDisableBtn2(true);
    setMessage("");

    try {
      const withdrawalData = {
        to,
        amount: Number(amount),
        currency: selectedAsset.currency,
        memo,
        authMethod: 'email',
        withdrawalToken,
      };

      let result;
      if (selectedAsset.currency === "hive" || selectedAsset.currency === "hive_dollar" || selectedAsset.currency === "hbd") {
        result = await processHiveWithdrawal(withdrawalData);
      } else {
        result = await processCryptoWithdrawal(withdrawalData);
      }

      setMessage(result?.message || "Withdrawal processed successfully");
      setStep(3);
      setDisableBtn2(false);
    } catch (error) {
      console.log(error);
      setMessage(error?.message || "Withdrawal failed");
      setDisableBtn2(false);
    }
  };

  const getToken = async () => {
    setDisableBtn(true);
    setSpinner(true);
    
    if (!amount || !to) {
      setMessage("Both Address and Amount fields are required");
      setDisableBtn(false); 
      setSpinner(false); 
      return; 
    }
    setMessage("");

    try {
      const data = await requestToken();
      if (data?.success === true) {
        setStep(2);
      } else {
        setMessage(data?.message || "Failed to send email verification code");
      }
    } catch (error) {
      console.log(error);
      setMessage(error?.message || "Failed to send email verification code");
    } finally {
      setDisableBtn(false);
      setSpinner(false);
    }
  };

  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

  const handleGetFees = async () => {
    try {
      const result = await getTransactionFees(selectedAsset.currency, selectedAsset.depositAddress, selectedAsset.depositAddress);
      setFee(result.fee);
    } catch (error) {
      console.error('Error fetching transaction fees:', error);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal testing" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose} title="Close">
          <IoClose size={18} />
        </button>
        <h2 className='w-header'>Send On-Chain</h2>
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
                <label htmlFor="hive-username">Hive Username (for Keychain signature):</label>
                <input
                  className='w-input'
                  type="text"
                  placeholder="e.g. yourhiveaccount"
                  value={hiveUsernameInput}
                  onChange={(e) => setHiveUsernameInput(e.target.value.trim().toLowerCase())}
                  id="hive-username"
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

            {selectedAsset.depositAddress ? (
              <>
                <div className="w-input-group">
                  <label htmlFor="recipient-account">Recipient Address:</label>
                  <input
                    className='w-input'
                    type="text"
                    placeholder={
                      (selectedAsset?.currency === 'tether' || selectedAsset?.coinId === 'tether')
                        ? "BEP-20 Address (0x...)"
                        : (selectedAsset?.currency === 'bitcoin' || selectedAsset?.coinId === 'bitcoin')
                        ? "Bitcoin Address (bc1q...)"
                        : "Recipient Account"
                    }
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    id="recipient-account"
                  />
                  {(selectedAsset?.currency === 'tether' || selectedAsset?.coinId === 'tether') && (
                    <span style={{ fontSize: '11px', color: '#10b981', display: 'block', marginTop: '3px' }}>
                      Network: BEP-20 (BNB Smart Chain). Ensure the recipient address supports BSC BEP-20 tokens.
                    </span>
                  )}
                </div>

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
                    <span>
                      Fee: {feeFormatted} ({selectedAsset?.symbol?.toUpperCase()})
                      {unitPrice > 0 && <span style={{ color: "var(--text-muted, #94a3b8)", marginLeft: "4px" }}>(${feeUsd})</span>}
                    </span>
                  </div>
                </div>
                
                {(selectedAsset?.currency === "hive" || selectedAsset?.currency === "hive_dollar" || selectedAsset?.currency === "hbd") && (
                  <>
                    <label htmlFor="memo">Memo (Optional):</label>
                    <input
                      className='w-input'
                      type="text"
                      id="memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="Enter memo"
                    />
                  </>
                )}

                <button
                  className="withdraw-btn"
                  onClick={authMethod === 'keychain' ? handleKeychainWithdrawal : getToken}
                  disabled={disableBtn}
                >
                  {spinner ? (
                    <Spinner />
                  ) : authMethod === 'keychain' ? (
                    "Sign & Withdraw with Keychain"
                  ) : (
                    "Request Email Token"
                  )}
                </button>
              </>
            ) : (
              <div className="withdrawal-info-wrapper">
                <h3 className='warning'>{selectedAsset?.currency}({selectedAsset?.symbol?.toUpperCase()}) withdrawal is coming soon...</h3>
                <span className='withdrawal-address-info-el'>No address/network available for this asset yet</span>
              </div>
            )}
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
            <button className="withdraw-btn" disabled={disableBtn2 || !withdrawalToken} onClick={handleGeneralWithdrawal}>
              {disableBtn2 ? <Spinner /> : "Confirm Withdrawal"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>✅</div>
            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Withdrawal Request Submitted</h4>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px', marginBottom: '20px' }}>
              {message || "Your withdrawal has been successfully submitted."}
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

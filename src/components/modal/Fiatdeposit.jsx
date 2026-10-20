import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { LuBadgeInfo } from "react-icons/lu";
import { getRandomMerchant, createNairaDepositRequest } from '../../api/ekzat';
import { Loader } from '../loader/Loader';
import { copyToClipboard } from '../../utils';
import './fiat-deposit.scss';

function Fiatdeposit({ isOpen, onClose }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [step, setStep] = useState(1);
  const [merchantInfo, setMerchantInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const notAllowed = !depositAmount || Number(depositAmount) < 1000;

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setDepositAmount(value);
    setDisplayAmount(value ? `₦${Number(value).toLocaleString()}` : "");
  };

  const setQuickAmount = (val) => {
    setDepositAmount(String(val));
    setDisplayAmount(`₦${Number(val).toLocaleString()}`);
  };

  const handleCopy = (key, text) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const getMerchant = async () => {
    if (!depositAmount || Number(depositAmount) < 1000) {
      toast.warning("Minimum deposit amount is ₦1,000");
      return;
    }
    setLoading(true);
    try {
      const merchantData = await getRandomMerchant();
      setMerchantInfo(merchantData);
      setStep(2);
      setLoading(false);
    } catch (error) {
      toast.error(error?.message || "Failed to find available merchant");
      setLoading(false);
    }
  };

  const createDeposit = async () => {
    setLoading(true);
    const depositData = {
      amount: depositAmount,
      narration: merchantInfo?.narration,
      merchantId: merchantInfo?.data?._id,
    };
    try {
      await createNairaDepositRequest(depositData);
      toast.success("Deposit request initiated successfully! Once confirmed, your balance will be updated.");
      setLoading(false);
      handleClose();
    } catch (error) {
      toast.error(error?.message || "Deposit request failed");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDepositAmount("");
    setDisplayAmount("");
    setStep(1);
    setMerchantInfo({});
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className="modal fiat-deposit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={handleClose} type="button" title="Close">
          <IoClose size={18} />
        </button>

        {loading && <Loader />}

        {step === 1 && (
          <div className="fiat-modal-body">
            <div className="modal-title-wrap">
              <h3>Deposit Fiat (NGN)</h3>
              <p className="modal-subtitle">Add Naira to your wallet instantly via bank transfer</p>
            </div>

            <div className="fiat-input-section">
              <label className="field-label">Deposit Amount</label>
              <div className="amount-input-card">
                <input
                  type="text"
                  placeholder="Min: ₦1,000"
                  value={displayAmount}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                  }}
                  className="fiat-amount-input"
                  autoFocus
                />
              </div>

              <div className="quick-amount-chips">
                {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="chip-btn"
                    onClick={() => setQuickAmount(amt)}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="deposit-info-banner">
              <LuBadgeInfo size={18} className="info-icon" />
              <span>Transfers are processed 24/7. Average processing time is under 5 minutes.</span>
            </div>

            <button
              disabled={notAllowed || loading}
              onClick={getMerchant}
              className={`fiat-primary-btn ${notAllowed ? 'disabled' : ''}`}
              type="button"
            >
              Continue to Payment Details
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fiat-modal-body">
            <div className="modal-title-wrap">
              <h3>Complete Bank Transfer</h3>
              <p className="modal-subtitle">Transfer the exact amount to the account below</p>
            </div>

            <div className="narration-warning-card">
              <LuBadgeInfo size={22} className="warning-icon" />
              <div className="warning-text-block">
                <strong>Important: Narration Code Required</strong>
                <p>You must paste the Narration code below into your bank transfer description.</p>
              </div>
            </div>

            <div className="bank-details-grid">
              <div className="detail-row highlight-row">
                <span className="detail-key">Amount to Pay</span>
                <div className="detail-val-wrap">
                  <strong className="detail-val amount-val">₦{Number(depositAmount).toLocaleString()}</strong>
                  <button
                    type="button"
                    className="copy-chip"
                    onClick={() => handleCopy('amount', depositAmount)}
                    title="Copy amount"
                  >
                    {copiedKey === 'amount' ? <FaCheck size={12} color="#10b981" /> : <FaCopy size={12} />}
                  </button>
                </div>
              </div>

              <div className="detail-row highlight-row">
                <span className="detail-key">Narration / Remark</span>
                <div className="detail-val-wrap">
                  <strong className="detail-val narration-val">{merchantInfo?.narration}</strong>
                  <button
                    type="button"
                    className="copy-chip highlight"
                    onClick={() => handleCopy('narration', merchantInfo?.narration)}
                    title="Copy narration"
                  >
                    {copiedKey === 'narration' ? <FaCheck size={12} color="#10b981" /> : <FaCopy size={12} />}
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-key">Bank Name</span>
                <div className="detail-val-wrap">
                  <span className="detail-val">{merchantInfo?.data?.bankName}</span>
                  <button
                    type="button"
                    className="copy-chip"
                    onClick={() => handleCopy('bank', merchantInfo?.data?.bankName)}
                  >
                    {copiedKey === 'bank' ? <FaCheck size={12} color="#10b981" /> : <FaCopy size={12} />}
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-key">Account Number</span>
                <div className="detail-val-wrap">
                  <span className="detail-val monospace">{merchantInfo?.data?.accountNumber}</span>
                  <button
                    type="button"
                    className="copy-chip"
                    onClick={() => handleCopy('account', merchantInfo?.data?.accountNumber)}
                  >
                    {copiedKey === 'account' ? <FaCheck size={12} color="#10b981" /> : <FaCopy size={12} />}
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-key">Account Name</span>
                <div className="detail-val-wrap">
                  <span className="detail-val">{merchantInfo?.data?.accountName}</span>
                  <button
                    type="button"
                    className="copy-chip"
                    onClick={() => handleCopy('name', merchantInfo?.data?.accountName)}
                  >
                    {copiedKey === 'name' ? <FaCheck size={12} color="#10b981" /> : <FaCopy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="button-actions-wrap">
              <button
                onClick={createDeposit}
                className="fiat-primary-btn"
                type="button"
                disabled={loading}
              >
                I Have Sent the Payment
              </button>
              <button
                onClick={() => setStep(1)}
                className="fiat-secondary-btn"
                type="button"
              >
                Change Amount
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Fiatdeposit;

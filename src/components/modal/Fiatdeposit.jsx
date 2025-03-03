import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { IoIosCopy } from 'react-icons/io';
import { getRandomMerchant, createNairaDepositRequest } from '../../api/ekzat';
import { Loader } from '../loader/Loader';
import { copyToClipboard } from '../../utils';
import './fiat-deposit.scss';
import { LuBadgeInfo } from "react-icons/lu";

function Fiatdeposit({ isOpen, onClose }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState(""); // State for displaying "₦" symbol
  const [step, setStep] = useState(1);
  const [merchantInfo, setMerchantInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const notAllowed = !depositAmount;

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setDepositAmount(value);
    setDisplayAmount(value ? `₦${value}` : ""); // Update display with "₦"
  };

  const getMerchant = async () => {
    setLoading(true);
    try {
      if (!depositAmount || Number(depositAmount) < 1000) {
        setLoading(false);
        toast.warning("Invalid amount, amount must be at least 1000", {
          style: {
            backgroundColor: 'rgba(229, 229, 229, 0.1)',
            color: '#fff',
            fontSize: '16px',
            marginTop: "60px"
          },
        });
        return;
      }
      const merchantData = await getRandomMerchant();
        setMerchantInfo(merchantData);
        setStep(2);
        setLoading(false);
    } catch (error) {
      toast.warning(error?.message, {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
      setLoading(false);
    }
  };

  const createDeposit = async () => {
    setLoading(true);
    const depositData = {
      amount: depositAmount,
      narration: merchantInfo.narration,
      merchantId: merchantInfo.data._id,
    };
    try {
      await createNairaDepositRequest(depositData);
      onClose();
      toast.success("Deposit request made successfully", {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className={`fadded-container modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`modal-overlay  ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
      <div className="modal f-d-modal-start ">
        {loading && <Loader />}
        <div className="fiat-d-modal-content">
          {step === 1 && (
            <>
              <div className="fiat-deposit-wrap">
                <h3>Fiat Deposit</h3>
                <span className="close-modal" onClick={onClose}>X</span>
                <div className="fiat-deposit-amount">
                  <label>Enter amount to Deposit</label>
                  <input
                    type="text"
                    placeholder="Min: ₦1000"
                    value={displayAmount} 
                    onChange={handleInputChange}
                  />
                </div>
                <button
                  style={{ cursor: notAllowed ? "not-allowed" : "pointer", width: "100%" }}
                  disabled={notAllowed}
                  onClick={getMerchant}
                  className='btn'
                >
                  Proceed
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="bank-peer-wrap">
                <span className="close-btn" onClick={() => { onClose(); setDepositAmount(""); setDisplayAmount(""); setStep(1); }}>X</span>
                <div className="deposit-head-text-wrap">
                  <span className='f-d-header'>Deposit Details</span>
                  <span className='wrap'>
                    <LuBadgeInfo className='caution-icon' />
                    <p className="warning-text">Note: Narration is very necessary for us to identify your deposit.</p>
                  </span>
                </div>
                <div className="bank-details-wrap">
                  <div className="detail-item">
                    <span>Amount:</span>
                    <span className='copy-text-wrap'>
                      ₦{depositAmount}
                      <IoIosCopy onClick={() => copyToClipboard(`${depositAmount}`)} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Narration:</span>
                    <span className='copy-text-wrap'>
                      {merchantInfo.narration}
                      <IoIosCopy onClick={() => copyToClipboard(merchantInfo.narration)} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Merchant:</span>
                    <span className='copy-text-wrap'>
                      {merchantInfo?.data.username}
                      <IoIosCopy onClick={() => copyToClipboard(merchantInfo?.data.username || '')} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Account Number:</span>
                    <span className='copy-text-wrap'>
                      {merchantInfo?.data.accountNumber}
                      <IoIosCopy onClick={() => copyToClipboard(merchantInfo?.data.accountNumber || '')} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Bank:</span>
                    <span className='copy-text-wrap'>
                      {merchantInfo?.data.bankName}
                      <IoIosCopy onClick={() => copyToClipboard(merchantInfo?.data.bankName || '')} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Account Name:</span>
                    <span className='copy-text-wrap'>
                      {merchantInfo?.data.accountName}
                      <IoIosCopy onClick={() => copyToClipboard(merchantInfo?.data.accountName || '')} />
                    </span>
                  </div>
                </div>
                <button
                  onClick={createDeposit}
                  className="done-transfer-btn"
                >
                  I have made payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Fiatdeposit;

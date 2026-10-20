import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { RiArrowDownSFill } from 'react-icons/ri';
import { Dropdown } from '../dropdown/Dropdown';
import { getUserProfile } from '../../api/profile';
import { generateAddress } from '../../api/ekzat';
import './deposit-modal.scss';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { HiExclamationTriangle } from 'react-icons/hi2';
import QRCode from "react-qr-code";

export const DepositHiveModal = ({ isOpen, onClose, assets, user }) => {
  const dispatch = useDispatch();

  const [selectedAsset, setSelectedAsset] = useState(assets?.[0]);
  const [openList, setOpenList] = useState(false);
  const [displaySearch, setDisplaySearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  const handleCopyAddress = () => {
    if (!selectedAsset?.depositAddress) return;
    navigator.clipboard.writeText(selectedAsset.depositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    toast.success("Deposit address copied to clipboard!");
  };

  const handleCopyMemo = () => {
    if (!selectedAsset?.memo) return;
    navigator.clipboard.writeText(selectedAsset.memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
    toast.success("Deposit memo copied to clipboard!");
  };

  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

  const createAddress = async (symbol) => {
    setLoading(true);
    try {
      const respone = await generateAddress(symbol);
      if (respone.success) {
        toast.success("Account address generated successfully");
        getUserProfile(dispatch);
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal">
        <button className="close-modal" onClick={onClose} title="Close">
          <IoClose size={18} />
        </button>

        <h2 className="d-header">Receive Crypto</h2>

        {/* Coin Selector */}
        <div className="d-main">
          <div className="d-coin-select-wrapper">
            <span className="label-tag">Select Asset</span>
            <div className="d-currency-select-wrap" onClick={handleOpencoinList}>
              {selectedAsset?.image && (
                <img className="d-coin-wrap" src={selectedAsset.image} alt={selectedAsset.currency} />
              )}
              <span className="d-picker-currency">
                {selectedAsset?.symbol || selectedAsset?.currency || 'Select Coin'}
              </span>
              <RiArrowDownSFill size={20} />
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

        {/* QR Code Container */}
        {selectedAsset?.depositAddress && (
          <div className="qr-code-wrapper">
            <div className="qr-frame">
              <QRCode
                size={140}
                value={selectedAsset.depositAddress}
                viewBox={`0 0 140 140`}
              />
            </div>
          </div>
        )}

        {/* Address and Memo Info */}
        <div className="deposit-address-group">
          {selectedAsset?.depositAddress ? (
            <div className="deposit-address">
              <span className="field-label">Deposit Address</span>
              <div className="wrap">
                <span className="val-text">{selectedAsset.depositAddress}</span>
                <button
                  type="button"
                  className="btn-copy-chip"
                  onClick={handleCopyAddress}
                  title="Copy address"
                >
                  {copiedAddress ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="deposit-address">
              <span className="field-label">Deposit Address</span>
              <div className="wrap">
                <span className="val-text" style={{ color: '#f59e0b' }}>
                  {selectedAsset?.currency || 'This asset'} deposit address is coming soon...
                </span>
              </div>
            </div>
          )}

          {/* Deposit Memo (if applicable) */}
          {selectedAsset?.memo && (
            <>
              <div className="deposit-address">
                <span className="field-label">Deposit Memo</span>
                <div className="wrap">
                  <span className="val-text">{selectedAsset.memo}</span>
                  <button
                    type="button"
                    className="btn-copy-chip"
                    onClick={handleCopyMemo}
                    title="Copy memo"
                  >
                    {copiedMemo ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedMemo ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Memo Required Alert */}
              <div className="memo-alert-box">
                <HiExclamationTriangle size={18} className="alert-icon" />
                <p>
                  <strong>Memo is required:</strong> Both the deposit address and memo are mandatory. 
                  Deposits sent without this exact memo cannot be credited automatically.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        <div className="note-wrap">
          <header>Deposit Notice</header>
          <ul>
            <li>Send only {selectedAsset?.symbol?.toUpperCase() || selectedAsset?.currency} to this deposit address.</li>
            <li>Credits are applied after standard blockchain network confirmations.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default DepositHiveModal;

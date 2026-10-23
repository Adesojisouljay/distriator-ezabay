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

  const isHiveAsset = selectedAsset?.currency === 'hive' || selectedAsset?.currency === 'hbd' || selectedAsset?.coinId === 'hive' || selectedAsset?.coinId === 'hive_dollar';
  const isBtc = selectedAsset?.currency === 'bitcoin' || selectedAsset?.coinId === 'bitcoin' || selectedAsset?.symbol?.toLowerCase() === 'btc';
  const isUsdt = selectedAsset?.currency === 'tether' || selectedAsset?.coinId === 'tether' || selectedAsset?.symbol?.toLowerCase() === 'usdt';

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
      if (respone && respone.success) {
        toast.success(respone.message || "Account address generated successfully");
        await getUserProfile(dispatch);
        if (respone.depositAddress) {
          setSelectedAsset((prev) => ({
            ...prev,
            depositAddress: respone.depositAddress,
            memo: respone.memo !== undefined ? respone.memo : prev?.memo,
          }));
        }
      } else {
        toast.error(respone?.message || "Failed to generate deposit address");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to generate address");
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
                {selectedAsset?.symbol?.toUpperCase() || selectedAsset?.currency || 'Select Coin'}
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
              {(isBtc || isUsdt) ? (
                <div className="wrap generate-address-wrap">
                  <span className="val-text" style={{ color: '#94a3b8', fontSize: '13px' }}>
                    No deposit address generated yet
                  </span>
                  <button
                    type="button"
                    className="btn-generate-deposit"
                    disabled={loading}
                    onClick={() => createAddress(selectedAsset?.coinId || selectedAsset?.currency)}
                  >
                    {loading ? 'Generating...' : 'Generate Address'}
                  </button>
                </div>
              ) : (
                <div className="wrap">
                  <span className="val-text" style={{ color: '#f59e0b', fontSize: '13px' }}>
                    {selectedAsset?.currency ? selectedAsset.currency.toUpperCase() : 'This asset'} deposit is coming soon...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Network Badges for Multi-Chain Assets */}
          {isUsdt && (
            <div className="deposit-address">
              <span className="field-label">Deposit Network</span>
              <div className="wrap">
                <span className="val-text" style={{ fontWeight: 600, color: '#10b981' }}>
                  BEP-20 (BNB Smart Chain)
                </span>
              </div>
            </div>
          )}

          {isBtc && (
            <div className="deposit-address">
              <span className="field-label">Deposit Network</span>
              <div className="wrap">
                <span className="val-text" style={{ fontWeight: 600, color: '#f59e0b' }}>
                  Bitcoin (Native SegWit Bech32)
                </span>
              </div>
            </div>
          )}

          {/* Deposit Memo (ONLY for Hive & HBD) */}
          {isHiveAsset && selectedAsset?.memo && (
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
            <li>
              Send only {isUsdt ? 'USDT via BEP-20 (BNB Smart Chain)' : (selectedAsset?.symbol?.toUpperCase() || selectedAsset?.currency)} to this deposit address.
            </li>
            {isUsdt && (
              <li style={{ color: '#10b981', fontWeight: 500 }}>
                Only send USDT via the BNB Smart Chain (BEP-20). Transfers via TRC-20, ERC-20, or other chains cannot be processed.
              </li>
            )}
            <li>Credits are applied after standard blockchain network confirmations.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default DepositHiveModal;

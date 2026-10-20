import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { BsPlusCircleFill } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { LuBadgeInfo } from "react-icons/lu";
import { FaBuildingColumns } from "react-icons/fa6";
import { requestToken, requestFiatWithdrawal } from "../../api/ekzat";
import { getUserProfile } from "../../api/profile";
import { GeneralDropdown } from "../dropdown/GeneralDrpdpown";
import { AddAccount } from "./AddAccount";
import Spinner from "../../components/spinner/Spinner";
import "./fiat-withdrawal.scss";

export const FiatWithdrawalModal = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state?.ekzaUser?.user);
  const userAccounts = user?.accounts || [];
  const dispatch = useDispatch();

  const [selectedAccount, setSelectedAccount] = useState(
    userAccounts.length > 0 ? userAccounts[0] : null
  );
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalToken, setWithdrawalToken] = useState("");
  const [requestedToken, setRequestedToken] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [openList, setOpenList] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);

  useEffect(() => {
    if (userAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(userAccounts[0]);
    }
  }, [userAccounts, selectedAccount]);

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

  const handleRequestToken = async () => {
    if (!withdrawalAmount) {
      toast.error("Please enter a withdrawal amount.");
      return;
    }
    if (Number(withdrawalAmount) < 500) {
      toast.error("Minimum withdrawal amount is ₦500.");
      return;
    }
    if (Number(withdrawalAmount) > Number(nairaBalance)) {
      toast.error("Insufficient Naira balance.");
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
        toast.error(response.message || "Failed to request withdrawal token.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to request withdrawal token.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddAccount = () => {
    setAddingAccount(true);
  };

  const closeAddAccount = () => {
    setAddingAccount(false);
  };

  const handleSubmit = async () => {
    if (!withdrawalAmount || !selectedAccount?.accountNumber || !withdrawalToken) {
      toast.error("Please enter amount, select account, and input the token.");
      return;
    }

    try {
      setIsLoading(true);
      const withdrawalData = {
        amount: withdrawalAmount,
        accountNumber: selectedAccount?.accountNumber,
        withdrawalToken,
      };
      const response = await requestFiatWithdrawal(withdrawalData);

      if (response.success) {
        getUserProfile(dispatch);
        toast.success("Withdrawal request submitted successfully!");
        handleClose();
      } else {
        toast.error(response.message || "Withdrawal request failed.");
      }
    } catch (error) {
      toast.error(error.message || "Withdrawal failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenList = () => {
    setOpenList(!openList);
  };

  const handleClose = () => {
    setWithdrawalAmount("");
    setWithdrawalToken("");
    setRequestedToken(false);
    setTokenExpiry(null);
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={handleClose}>
      <div className="modal fiat-withdrawal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={handleClose} type="button" title="Close">
          <IoClose size={18} />
        </button>

        <div className="fiat-modal-body">
          <div className="modal-title-wrap">
            <h3>Fiat Withdrawal (NGN)</h3>
            <p className="modal-subtitle">Transfer funds directly to your verified bank account</p>
          </div>

          {userAccounts.length === 0 ? (
            <div className="no-account-state">
              <div className="empty-icon-box">
                <FaBuildingColumns size={32} />
              </div>
              <h4>No Bank Account Linked</h4>
              <p>You need to add a Nigerian bank account before you can withdraw funds.</p>
              <button className="fiat-primary-btn" onClick={openAddAccount} type="button">
                <BsPlusCircleFill size={16} />
                <span>Add Bank Account</span>
              </button>
            </div>
          ) : (
            <>
              {!requestedToken ? (
                <div className="withdrawal-form-step">
                  {/* Amount Input */}
                  <div className="fiat-input-section">
                    <div className="label-balance-row">
                      <label className="field-label">Withdrawal Amount</label>
                      <div className="balance-indicator">
                        <span>Balance: ₦{Number(nairaBalance).toLocaleString()}</span>
                        <button
                          type="button"
                          className="max-pill"
                          onClick={() => setWithdrawalAmount(nairaBalance)}
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <div className="amount-input-card">
                      <input
                        id="amount"
                        type="number"
                        placeholder="Min: ₦500"
                        value={withdrawalAmount}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, "");
                          if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);
                          setWithdrawalAmount(val);
                        }}
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                        }}
                        min="0"
                        step="any"
                        className="fiat-amount-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Account Selector */}
                  <div className="account-select-section">
                    <div className="account-select-header">
                      <span className="field-label">Destination Bank Account</span>
                      <button
                        type="button"
                        className="add-acc-link"
                        onClick={openAddAccount}
                      >
                        <BsPlusCircleFill size={13} />
                        <span>Add New</span>
                      </button>
                    </div>

                    <GeneralDropdown
                      items={userAccounts}
                      setSelectedItem={setSelectedAccount}
                      handleOpenList={handleOpenList}
                      openList={openList}
                      itemName={selectedAccount?.bankName || "Select Account"}
                      selectLabal="account"
                    />

                    {selectedAccount?.accountNumber && (
                      <div className="selected-acc-card">
                        <div className="acc-info-row">
                          <span className="acc-key">Bank:</span>
                          <span className="acc-val">{selectedAccount?.bankName}</span>
                        </div>
                        <div className="acc-info-row">
                          <span className="acc-key">Account Name:</span>
                          <span className="acc-val">{selectedAccount?.accountName}</span>
                        </div>
                        <div className="acc-info-row">
                          <span className="acc-key">Account Number:</span>
                          <span className="acc-val monospace">{selectedAccount?.accountNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="fiat-primary-btn"
                    onClick={handleRequestToken}
                    disabled={isLoading || !withdrawalAmount || Number(withdrawalAmount) < 500}
                    type="button"
                  >
                    {isLoading ? <Spinner /> : "Request Security Token"}
                  </button>
                </div>
              ) : (
                <div className="token-verification-step">
                  <div className="token-alert-banner">
                    <LuBadgeInfo size={20} className="info-icon" />
                    <p>A verification code was sent to your email. Enter it below to complete withdrawal.</p>
                  </div>

                  <div className="fiat-input-section">
                    <label className="field-label">Verification Code</label>
                    <div className="amount-input-card">
                      <input
                        id="token"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={withdrawalToken}
                        onChange={(e) => setWithdrawalToken(e.target.value)}
                        className="fiat-amount-input token-input"
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
                      onClick={handleSubmit}
                      disabled={isLoading || !withdrawalToken}
                      type="button"
                    >
                      {isLoading ? "Processing..." : "Confirm & Submit Withdrawal"}
                    </button>
                    <button
                      className="fiat-secondary-btn"
                      onClick={() => setRequestedToken(false)}
                      type="button"
                    >
                      Back to Edit Amount
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {addingAccount && (
        <AddAccount isOpen={addingAccount} onClose={closeAddAccount} />
      )}
    </div>
  );
};

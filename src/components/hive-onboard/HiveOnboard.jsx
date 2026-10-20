import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getAccount } from "../../hive-client";
import { createHiveAccount, getAccountKeys } from '../../api/hive';
import { getUserProfile } from '../../api/profile';
import { validateHiveUsername } from "../../utils";
import hiveLogo from "../../assets/hive-logo.png";
import success from "../../assets/succes.gif";
import { 
  FaCheck, 
  FaTimes, 
  FaCopy, 
  FaShieldAlt, 
  FaExternalLinkAlt 
} from "react-icons/fa";
import { 
  HiOutlineEnvelope, 
  HiExclamationTriangle, 
  HiOutlineSparkles
} from "react-icons/hi2";
import { MdOutlineDownload } from "react-icons/md";
import { IoArrowBack, IoCheckmarkCircle } from "react-icons/io5";
import "./index.scss";

export const HiveOnboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.ekzaUser?.user);
  const hiveAsset = user?.assets?.find(
    (a) => (a.currency || a.symbol)?.toLowerCase() === "hive"
  ) || user?.assets?.[0];

  const fee = 1;
  const hivePriceInNaira = hiveAsset?.nairaValue || 407.92;
  const feeInNaira = (hivePriceInNaira * fee).toFixed(2);
  const userNairaBalance = Number(user?.nairaBalance || 0);
  const userHiveBalance = Number(hiveAsset?.balance || 0);

  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [step, setStep] = useState(1);
  const [newHiveAccount, setNewHiveAccount] = useState(null);
  const [message, setMessage] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameValid, setUsernameValid] = useState(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [feeType, setFeeType] = useState('hive');
  const [copiedKey, setCopiedKey] = useState({});
  const [confirmedBackup, setConfirmedBackup] = useState(false);

  const debounceTimer = useRef(null);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (username.trim()) {
      clearTimeout(debounceTimer.current);
      setCheckingUsername(true);
      setMessage(null);
      debounceTimer.current = setTimeout(() => {
        checkHiveAccountAvailability(username.trim().toLowerCase());
      }, 450);
    } else {
      setMessage(null);
      setUsernameAvailable(null);
      setUsernameValid(null);
      setCheckingUsername(false);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [username]);

  const checkHiveAccountAvailability = async (cleanedUsername) => {
    let validationErr = "";
    const isValid = validateHiveUsername(cleanedUsername, (msg) => {
      validationErr = msg;
    });

    if (!isValid) {
      setUsernameValid(false);
      setUsernameAvailable(false);
      setMessage(validationErr || "Invalid username format");
      setCheckingUsername(false);
      return;
    }

    setUsernameValid(true);

    try {
      const account = await getAccount(cleanedUsername);
      if (account) {
        setMessage("Username is already taken on Hive");
        setUsernameAvailable(false);
      } else {
        setMessage("Username is available!");
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error("Hive lookup error:", error);
      setMessage("Could not verify username availability");
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const usernameChanged = (e) => {
    const rawVal = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, "");
    setUsername(rawVal);
  };

  const getKeysStep = async (e) => {
    e.preventDefault();
    if (!usernameAvailable || !usernameValid) {
      toast.error("Please choose a valid and available username");
      return;
    }
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await getAccountKeys(username);
      if (response.success) {
        setNewHiveAccount(response.accountDetails);
        setStep(2);
        toast.info("Keys generated! Please safely back up your keys before proceeding.");
      } else {
        toast.error(response.message || "Failed to generate account keys");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error generating keys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyIndividualKey = (label, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey((prev) => ({ ...prev, [label]: true }));
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedKey((prev) => ({ ...prev, [label]: false }));
    }, 2000);
  };

  const handleDownload = () => {
    const accountData = `=====================================================
HIVE BLOCKCHAIN ACCOUNT DETAILS - KEEP STRICTLY CONFIDENTIAL
=====================================================

Account Username: @${newHiveAccount?.username}
Creation Date: ${new Date().toUTCString()}

-----------------------------------------------------
1. MASTER PASSWORD (ROOT ACCESS - KEEP STRICTLY OFFLINE)
-----------------------------------------------------
Password: ${newHiveAccount?.masterPassword}

Usage: Used to derive and reset all other private keys. 
Never enter this on untrusted apps or websites!

-----------------------------------------------------
2. PRIVATE KEYS (FOR DAILY USE & HIVE KEYCHAIN)
-----------------------------------------------------

[POSTING PRIVATE KEY]
Key: ${newHiveAccount?.posting}
Permissions: Social interactions, publishing posts, voting, reblogging, commenting.
Tip: This is the safest key to import into Hive Keychain for 1-click passwordless login.

[ACTIVE PRIVATE KEY]
Key: ${newHiveAccount?.active}
Permissions: Transfers, token transfers, exchange orders, power up / power down.
Tip: Keep this key secure and use only when authorizing transactions.

[OWNER PRIVATE KEY]
Key: ${newHiveAccount?.owner}
Permissions: Changing account passwords, rotating keys, master account recovery.
Tip: Keep stored in cold storage (printed paper or secure hardware vault).

[MEMO PRIVATE KEY]
Key: ${newHiveAccount?.memo}
Permissions: Encrypting and decrypting private transfer memos.

=====================================================
RECOMMENDED NEXT STEPS:
1. Install Hive Keychain (https://hive-keychain.com) on your browser or mobile phone.
2. Import @${newHiveAccount?.username} using your Posting & Active keys.
3. Print this file or store it in an encrypted password manager (1Password, Bitwarden, KeePass).
4. Do NOT lose these keys. Hive accounts cannot be recovered if keys are lost.
=====================================================`;

    const blob = new Blob([accountData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${newHiveAccount?.username}_Hive_Account_Keys.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setIsDownloaded(true);
    setConfirmedBackup(true);
    toast.success("Account keys downloaded successfully!");
  };

  const createAccount = async (e) => {
    if (e) e.preventDefault();
    if (!isDownloaded && !confirmedBackup) {
      toast.warn("Please download your keys before creating your account!");
      return;
    }

    setLoading(true);
    try {
      const hiveAccountData = {
        username,
        email,
        fee: feeType === "hive" ? fee : (hivePriceInNaira * fee).toFixed(3),
        feeType,
        accountKeys: newHiveAccount,
      };

      const response = await createHiveAccount(hiveAccountData);
      if (response.success) {
        setNewHiveAccount(response.accountDetails);
        setStep(3);
        toast.success("Account created successfully on the Hive blockchain!");
        getUserProfile(dispatch);
      } else {
        toast.error(response.message || "Failed to create Hive account");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error creating account. Please check your balance.");
    } finally {
      setLoading(false);
    }
  };

  const hasSufficientBalance =
    feeType === "hive"
      ? userHiveBalance >= fee
      : userNairaBalance >= Number(feeInNaira);

  return (
    <div className="hive-onboard-page-container">
      {/* Breadcrumb Navigation */}
      <div className="hive-onboard-breadcrumb">
        <Link to="/dashboard" className="back-link">
          <IoArrowBack size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <span className="separator">/</span>
        <span className="current">Create Hive Account</span>
      </div>

      <div className={`hive-onboard-card step-${step}`}>
        {/* Card Header */}
        <div className="hive-onboard-header">
          <div className="hive-logo-badge">
            <img src={hiveLogo} alt="Hive" className="hive-logo-img" />
          </div>
          <div className="header-text-group">
            <h2>Create Hive Account</h2>
            <p>
              Get your permanent, decentralized Web3 identity on the Hive
              blockchain.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="onboard-step-tracker">
          <div className={`step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
            <div className="step-circle">{step > 1 ? <FaCheck size={11} /> : "1"}</div>
            <span className="step-label">Account Info</span>
          </div>
          <div className={`step-line ${step >= 2 ? "active" : ""}`} />
          <div className={`step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
            <div className="step-circle">{step > 2 ? <FaCheck size={11} /> : "2"}</div>
            <span className="step-label">Backup Keys</span>
          </div>
          <div className={`step-line ${step >= 3 ? "active" : ""}`} />
          <div className={`step-node ${step === 3 ? "active completed" : ""}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Ready</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: FORM */}
        {/* ========================================================= */}
        {step === 1 && (
          <form className="onboard-form" onSubmit={getKeysStep}>
            {/* Account Fee Callout */}
            <div className="account-fee-callout">
              <div className="fee-icon-wrap">
                <HiOutlineSparkles size={18} />
              </div>
              <div className="fee-info-text">
                <span className="fee-title">Account Creation Fee:</span>
                <span className="fee-cost">
                  <strong>1.000 HIVE</strong> <span className="fee-sub">(≈ ₦{feeInNaira})</span>
                </span>
              </div>
            </div>

            {/* Username Input Group */}
            <div className="form-group-wrap">
              <label className="field-label" htmlFor="username">
                Hive Username
              </label>
              <div className={`input-card ${username ? (usernameAvailable ? "valid" : "invalid") : ""}`}>
                <span className="input-prefix">@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={usernameChanged}
                  placeholder="e.g. Satoshi"
                  maxLength={16}
                  autoComplete="off"
                  required
                />
                <div className="input-feedback-wrap">
                  {checkingUsername && (
                    <span className="feedback-pill checking">
                      <span className="mini-spinner" /> Checking...
                    </span>
                  )}
                  {!checkingUsername && username && usernameAvailable === true && (
                    <span className="feedback-pill valid">
                      <FaCheck size={11} /> Available
                    </span>
                  )}
                  {!checkingUsername && username && usernameAvailable === false && (
                    <span className="feedback-pill invalid">
                      <FaTimes size={11} /> Taken
                    </span>
                  )}
                </div>
              </div>
              <span className={`helper-note ${username && !usernameValid ? "error-text" : ""}`}>
                {message || "Must be 3-16 characters: lowercase letters, numbers, or single hyphens/dots."}
              </span>
            </div>

            {/* Email Input Group */}
            <div className="form-group-wrap">
              <label className="field-label" htmlFor="email">
                Notification Email
              </label>
              <div className="input-card">
                <HiOutlineEnvelope className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <span className="helper-note">
                Your keyfile backup receipt and setup instructions will be sent here.
              </span>
            </div>

            {/* Payment Method Cards */}
            <div className="form-group-wrap">
              <label className="field-label">Payment Source</label>
              <div className="payment-options-grid">
                {/* Option 1: HIVE */}
                <div
                  className={`payment-option-card ${feeType === "hive" ? "selected" : ""}`}
                  onClick={() => setFeeType("hive")}
                >
                  <div className="option-header">
                    <img src={hiveLogo} alt="Hive" className="currency-icon" />
                    <span className="option-title">Pay with HIVE</span>
                    <div className="selection-radio">
                      {feeType === "hive" && <div className="radio-inner" />}
                    </div>
                  </div>
                  <div className="option-body">
                    <span className="option-price">1.000 HIVE</span>
                    <span className="option-bal">
                      Wallet: {userHiveBalance.toFixed(3)} HIVE
                    </span>
                  </div>
                </div>

                {/* Option 2: Naira */}
                <div
                  className={`payment-option-card ${feeType === "NGN" ? "selected" : ""}`}
                  onClick={() => setFeeType("NGN")}
                >
                  <div className="option-header">
                    <div className="currency-icon naira-pill">₦</div>
                    <span className="option-title">Pay with Naira</span>
                    <div className="selection-radio">
                      {feeType === "NGN" && <div className="radio-inner" />}
                    </div>
                  </div>
                  <div className="option-body">
                    <span className="option-price">₦{feeInNaira}</span>
                    <span className="option-bal">
                      Cash: ₦{userNairaBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {!hasSufficientBalance && (
                <div className="balance-warning-banner">
                  <HiExclamationTriangle size={16} />
                  <span>
                    Insufficient {feeType === "hive" ? "HIVE" : "Naira"} balance.{" "}
                    <Link to="/wallet" className="deposit-link">
                      Deposit funds
                    </Link>{" "}
                    to continue.
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-onboard-action"
              disabled={
                loading ||
                checkingUsername ||
                !usernameAvailable ||
                !usernameValid ||
                !hasSufficientBalance
              }
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Generating Account Keys...</span>
                </>
              ) : (
                <span>Generate Keys & Continue →</span>
              )}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: KEY BACKUP */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="onboard-step-2-content">
            {/* Security Alert Banner */}
            <div className="security-alert-box">
              <HiExclamationTriangle size={22} className="alert-icon" />
              <div className="alert-text">
                <h4>Non-Custodial Warning</h4>
                <p>
                  Hive is a decentralized blockchain. Ezabay does <strong>not</strong> save
                  or store your private keys. If you lose them, your account can
                  never be recovered. Save them in a secure password manager!
                </p>
              </div>
            </div>

            {/* Generated Keys Display */}
            <div className="keys-scroll-list">
              {/* Master Password */}
              <div className="key-item-card master-card">
                <div className="key-header">
                  <div className="key-title-wrap">
                    <span className="key-name">Master Password</span>
                    <span className="permission-badge danger">Root Access</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-key"
                    onClick={() => copyIndividualKey("Master Password", newHiveAccount?.masterPassword)}
                  >
                    {copiedKey["Master Password"] ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedKey["Master Password"] ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="key-value-wrap">
                  <code>{newHiveAccount?.masterPassword}</code>
                </div>
                <span className="key-desc">
                  Used only to reset or derive all other keys. Store offline!
                </span>
              </div>

              {/* Active Key */}
              <div className="key-item-card">
                <div className="key-header">
                  <div className="key-title-wrap">
                    <span className="key-name">Active Private Key</span>
                    <span className="permission-badge warning">Wallet / Transfers</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-key"
                    onClick={() => copyIndividualKey("Active Key", newHiveAccount?.active)}
                  >
                    {copiedKey["Active Key"] ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedKey["Active Key"] ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="key-value-wrap">
                  <code>{newHiveAccount?.active}</code>
                </div>
                <span className="key-desc">
                  Required for transfers, staking, power up/down, and trade orders.
                </span>
              </div>

              {/* Posting Key */}
              <div className="key-item-card">
                <div className="key-header">
                  <div className="key-title-wrap">
                    <span className="key-name">Posting Private Key</span>
                    <span className="permission-badge success">Social & Keychain</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-key"
                    onClick={() => copyIndividualKey("Posting Key", newHiveAccount?.posting)}
                  >
                    {copiedKey["Posting Key"] ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedKey["Posting Key"] ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="key-value-wrap">
                  <code>{newHiveAccount?.posting}</code>
                </div>
                <span className="key-desc">
                  Safe for Hive Keychain logins, publishing posts, voting, and reblogging.
                </span>
              </div>

              {/* Owner Key */}
              <div className="key-item-card">
                <div className="key-header">
                  <div className="key-title-wrap">
                    <span className="key-name">Owner Private Key</span>
                    <span className="permission-badge danger">Account Recovery</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-key"
                    onClick={() => copyIndividualKey("Owner Key", newHiveAccount?.owner)}
                  >
                    {copiedKey["Owner Key"] ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedKey["Owner Key"] ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="key-value-wrap">
                  <code>{newHiveAccount?.owner}</code>
                </div>
                <span className="key-desc">
                  Account recovery key. Keep stored securely offline.
                </span>
              </div>

              {/* Memo Key */}
              <div className="key-item-card">
                <div className="key-header">
                  <div className="key-title-wrap">
                    <span className="key-name">Memo Private Key</span>
                    <span className="permission-badge neutral">Encryption</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-key"
                    onClick={() => copyIndividualKey("Memo Key", newHiveAccount?.memo)}
                  >
                    {copiedKey["Memo Key"] ? <FaCheck size={12} /> : <FaCopy size={12} />}
                    <span>{copiedKey["Memo Key"] ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="key-value-wrap">
                  <code>{newHiveAccount?.memo}</code>
                </div>
                <span className="key-desc">
                  Used to decrypt private encrypted transfer memos on Hive.
                </span>
              </div>
            </div>

            {/* Download Keyfile Action */}
            <button
              type="button"
              className={`btn-download-keyfile ${isDownloaded ? "downloaded" : ""}`}
              onClick={handleDownload}
            >
              <MdOutlineDownload size={22} />
              <span>
                {isDownloaded ? "Download Keyfile Again (.txt)" : "Download Keyfile Backup (.txt)"}
              </span>
              {isDownloaded && <IoCheckmarkCircle size={20} className="check-done" />}
            </button>

            {/* Checkbox Acknowledgment */}
            <label className="checkbox-confirmation-wrap">
              <input
                type="checkbox"
                checked={confirmedBackup}
                onChange={(e) => setConfirmedBackup(e.target.checked)}
              />
              <span>
                I have securely downloaded and backed up my Master Password and Private Keys.
              </span>
            </label>

            {/* Final Creation Button */}
            <button
              type="button"
              className="btn-onboard-action final"
              disabled={loading || (!isDownloaded && !confirmedBackup)}
              onClick={createAccount}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Registering @{username} on Hive...</span>
                </>
              ) : (
                <span>Complete Account Creation ({feeType === "hive" ? "1 HIVE" : `₦${feeInNaira}`})</span>
              )}
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: SUCCESS */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="onboard-step-3-content">
            <div className="celebration-badge">
              <img src={success} alt="Success" className="success-gif" />
            </div>

            <div className="success-text-block">
              <h3>Welcome to Hive!</h3>
              <p className="account-tag">@{username}</p>
              <p className="success-desc">
                Your Hive account is now live on the blockchain. You can now publish,
                earn crypto rewards, vote, and trade across the entire Hive Web3 ecosystem!
              </p>
            </div>

            {/* Keychain Integration Tip */}
            <div className="keychain-tip-card">
              <div className="tip-header">
                <FaShieldAlt size={18} className="tip-icon" />
                <h4>Next: Install Hive Keychain</h4>
              </div>
              <p>
                Import your <strong>@{username}</strong> Posting and Active keys into the
                Hive Keychain browser extension or mobile app for seamless 1-click
                logins and transactions across Ezabay and all Hive dApps.
              </p>
              <a
                href="https://hive-keychain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="keychain-link"
              >
                <span>Get Hive Keychain</span>
                <FaExternalLinkAlt size={11} />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="success-action-buttons">
              <button
                type="button"
                className="btn-download-again"
                onClick={handleDownload}
              >
                <MdOutlineDownload size={18} />
                <span>Download Keys Again</span>
              </button>
              <Link to="/dashboard" className="btn-go-dashboard">
                <span>Go to Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiveOnboard;

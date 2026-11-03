import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getKeychainChallenge, loginWithKeychainApi, registerWithKeychainApi } from '../../api/auth';
import { loginSuccess } from '../../redux/userReducer';
import { setCurrency } from '../../redux/currencySlice';
import { currenciesList } from '../../vairables/protectedRoutes';
import { countriesList } from '../../vairables/countries';
import keychainLogo from '../../assets/keychain-logo.png';
import Spinner from '../spinner/Spinner';
import './keychain-login-modal.scss';

export const KeychainLoginModal = ({ isOpen, onClose, initialMode = 'login', defaultReferral = '' }) => {
  const dispatch = useDispatch();

  // Step 1: Keychain signature verification
  // Step 2: Complete profile (First/Last name, email, country, referral)
  const [step, setStep] = useState(1);
  const [hiveUsername, setHiveUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [keychainInstalled, setKeychainInstalled] = useState(true);

  // Step 2 state
  const [registrationToken, setRegistrationToken] = useState('');
  const [verifiedHiveUser, setVerifiedHiveUser] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [referralCode, setReferralCode] = useState(defaultReferral || '');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setStatusMessage('');
      setLoading(false);
      setStep(1);
      setRegistrationToken('');
      setVerifiedHiveUser('');
      const savedUser = localStorage.getItem('lastHiveUsername') || '';
      if (savedUser) {
        setHiveUsername(savedUser);
      }
      if (defaultReferral) {
        setReferralCode(defaultReferral);
      }
      const isInstalled = typeof window !== 'undefined' && Boolean(window.hive_keychain);
      setKeychainInstalled(isInstalled);
    }
  }, [isOpen, defaultReferral]);

  if (!isOpen) return null;

  // Step 1: Sign in with Keychain
  const handleKeychainLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setStatusMessage('');

    const cleanUser = hiveUsername.trim().replace(/^@/, '').toLowerCase();
    if (!cleanUser) {
      setError('Please enter your Hive username.');
      return;
    }

    if (typeof window === 'undefined' || !window.hive_keychain) {
      setKeychainInstalled(false);
      setError('Hive Keychain extension was not detected. Please install it or use Keychain Browser.');
      return;
    }

    setLoading(true);
    setStatusMessage('Requesting challenge from server...');

    try {
      // 1. Get unique challenge from miner-server
      const challengeRes = await getKeychainChallenge(cleanUser);
      if (!challengeRes?.success || !challengeRes?.challenge) {
        setLoading(false);
        setStatusMessage('');
        setError(challengeRes?.message || 'Failed to retrieve login challenge.');
        return;
      }

      const challenge = challengeRes.challenge;
      setStatusMessage('Please approve the sign-in prompt in Hive Keychain...');

      // 2. Request signature from Hive Keychain extension
      window.hive_keychain.requestSignBuffer(
        cleanUser,
        challenge,
        'Posting',
        async (response) => {
          if (!response || !response.success) {
            setLoading(false);
            setStatusMessage('');
            setError(
              response?.message || 'Sign-in cancelled or rejected in Hive Keychain.'
            );
            return;
          }

          const signature = response.result;
          setStatusMessage('Verifying cryptographic signature...');

          // 3. Post signature to backend to authenticate
          const loginRes = await loginWithKeychainApi({
            username: cleanUser,
            challenge,
            signature,
          });

          if (loginRes?.data?.success) {
            // Check if this is a new user needing to complete Name & Email
            if (loginRes.data.isNewUser) {
              setLoading(false);
              setStatusMessage('');
              setRegistrationToken(loginRes.data.registrationToken);
              setVerifiedHiveUser(cleanUser);
              setStep(2);
              return;
            }

            // Existing user -> Log in immediately!
            localStorage.setItem('lastHiveUsername', cleanUser);
            setStatusMessage('Login successful! Redirecting...');
            dispatch(loginSuccess(loginRes.data));
            dispatch(setCurrency(currenciesList[0]));
            window.location.href = '/dashboard';
          } else {
            setLoading(false);
            setStatusMessage('');
            const failMsg =
              loginRes?.response?.data?.message ||
              loginRes?.data?.message ||
              'Keychain verification failed. Please check your username.';
            setError(failMsg);
          }
        }
      );
    } catch (err) {
      console.error('Hive Keychain login error:', err);
      setLoading(false);
      setStatusMessage('');
      setError('An unexpected error occurred during Keychain sign-in.');
    }
  };

  // Step 2: Complete Profile & Register
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your first and last name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address for notifications and receipts.');
      return;
    }

    if (!country) {
      setError('Please select your country.');
      return;
    }

    setLoading(true);
    setStatusMessage('Creating your account & generating multi-chain HD wallets...');

    try {
      const regRes = await registerWithKeychainApi({
        registrationToken,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country,
        referralCode: referralCode.trim() || undefined,
      });

      if (regRes?.data?.success) {
        localStorage.setItem('lastHiveUsername', verifiedHiveUser);
        setStatusMessage('Registration complete! Redirecting to your wallet...');
        dispatch(loginSuccess(regRes.data));
        dispatch(setCurrency(currenciesList[0]));
        window.location.href = '/dashboard';
      } else {
        setLoading(false);
        setStatusMessage('');
        const failMsg =
          regRes?.response?.data?.message ||
          regRes?.data?.message ||
          'Failed to complete registration. Please try again.';
        setError(failMsg);
      }
    } catch (err) {
      console.error('Keychain registration error:', err);
      setLoading(false);
      setStatusMessage('');
      setError('An error occurred while creating your account. Please try again.');
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal-backdrop-dismiss" onClick={loading ? undefined : onClose} />
      <div className="modal keychain-login-modal">
        <button
          type="button"
          className="keychain-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          &times;
        </button>

        {/* STEP 1: Keychain Signature */}
        {step === 1 && (
          <>
            <div className="keychain-header">
              <div className="keychain-logo-badge">
                <img src={keychainLogo} alt="Hive Keychain" />
              </div>
              <h2>{initialMode === 'signup' ? 'Sign up with Hive Keychain' : 'Hive Keychain Login'}</h2>
              <p className="keychain-subtitle">
                Instant, passwordless Web3 authentication powered by the Hive blockchain.
              </p>
            </div>

            {!keychainInstalled && (
              <div className="keychain-warning-banner">
                <span>Keychain Extension Not Detected</span>
                <p>
                  Please install the Hive Keychain extension or open this app inside Hive Keychain mobile.
                </p>
                <a
                  href="https://hive-keychain.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="keychain-install-link"
                >
                  Get Hive Keychain &rarr;
                </a>
              </div>
            )}

            <form onSubmit={handleKeychainLogin} className="keychain-form">
              <div className="keychain-input-group">
                <label htmlFor="hiveUsername">Hive Username</label>
                <div className="keychain-input-wrapper">
                  <span className="keychain-at-prefix">@</span>
                  <input
                    id="hiveUsername"
                    type="text"
                    autoFocus
                    disabled={loading}
                    value={hiveUsername}
                    onChange={(e) => setHiveUsername(e.target.value.toLowerCase())}
                    placeholder="your-hive-account"
                    autoComplete="username"
                  />
                </div>
                <span className="keychain-input-hint">
                  Posting key signature will be requested to verify your identity.
                </span>
              </div>

              {error && <div className="keychain-error-banner">{error}</div>}

              {statusMessage && (
                <div className="keychain-status-banner">
                  <div className="keychain-status-pulse" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="keychain-actions">
                <button
                  type="submit"
                  className="btn-keychain-submit"
                  disabled={loading || !hiveUsername.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span style={{ marginLeft: 8 }}>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign in with Keychain</span>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-keychain-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 2: Complete Profile Details */}
        {step === 2 && (
          <>
            <div className="keychain-header">
              <div className="keychain-logo-badge">
                <img src={keychainLogo} alt="Hive Keychain" />
              </div>
              <h2>Complete Your Profile</h2>
              <div className="keychain-verified-pill">
                <span className="pill-check">✓</span>
                <span>Verified Hive Account: <strong>@{verifiedHiveUser}</strong></span>
              </div>
              <p className="keychain-subtitle">
                Just a few details to enable deposit notifications, bank withdrawals & receipts.
              </p>
            </div>

            <form onSubmit={handleCompleteRegistration} className="keychain-form">
              <div className="keychain-form-row">
                <div className="keychain-input-group">
                  <label htmlFor="regFirstName">First Name</label>
                  <input
                    id="regFirstName"
                    type="text"
                    required
                    disabled={loading}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="keychain-field"
                  />
                </div>
                <div className="keychain-input-group">
                  <label htmlFor="regLastName">Last Name</label>
                  <input
                    id="regLastName"
                    type="text"
                    required
                    disabled={loading}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="keychain-field"
                  />
                </div>
              </div>

              <div className="keychain-input-group">
                <label htmlFor="regEmail">Email Address</label>
                <input
                  id="regEmail"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="keychain-field"
                />
                <span className="keychain-input-hint">
                  Used for fiat/crypto deposit alerts, withdrawal receipts & security notifications.
                </span>
              </div>

              <div className="keychain-form-row">
                <div className="keychain-input-group">
                  <label htmlFor="regCountry">Country</label>
                  <select
                    id="regCountry"
                    disabled={loading}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="keychain-select"
                  >
                    {countriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="keychain-input-group">
                  <label htmlFor="regReferral">Referral Code (Optional)</label>
                  <input
                    id="regReferral"
                    type="text"
                    disabled={loading}
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Referral Code"
                    className="keychain-field"
                  />
                </div>
              </div>

              {error && <div className="keychain-error-banner">{error}</div>}

              {statusMessage && (
                <div className="keychain-status-banner">
                  <div className="keychain-status-pulse" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="keychain-actions">
                <button
                  type="submit"
                  className="btn-keychain-submit"
                  disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span style={{ marginLeft: 8 }}>Finalizing Wallet...</span>
                    </>
                  ) : (
                    <span>Complete Registration &rarr;</span>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-keychain-cancel"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  &larr; Back
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default KeychainLoginModal;

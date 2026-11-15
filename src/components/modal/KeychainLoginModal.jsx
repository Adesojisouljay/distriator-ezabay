import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import QRCode from 'react-qr-code';
import HAS from 'hive-auth-wrapper';
import { getKeychainChallenge, loginWithKeychainApi } from '../../api/auth';
import { loginSuccess } from '../../redux/userReducer';
import { setCurrency } from '../../redux/currencySlice';
import { currenciesList } from '../../vairables/protectedRoutes';
import keychainLogo from '../../assets/keychain-logo.png';
import Spinner from '../spinner/Spinner';
import './keychain-login-modal.scss';

const hasClient = HAS.default || HAS;

export const KeychainLoginModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const dispatch = useDispatch();
  const [hiveUsername, setHiveUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [keychainInstalled, setKeychainInstalled] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Tab: 'extension' (1-click desktop extension) or 'mobile_qr' (Mobile app & QR code)
  const [activeTab, setActiveTab] = useState('extension');
  
  // Mobile HiveAuth QR state
  const [hasUri, setHasUri] = useState('');
  const [activeChallenge, setActiveChallenge] = useState('');
  const hasSessionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setStatusMessage('');
      setLoading(false);
      setHasUri('');
      setActiveChallenge('');
      
      const savedUser = localStorage.getItem('lastHiveUsername') || '';
      if (savedUser) {
        setHiveUsername(savedUser);
      }
      
      const isMobile =
        typeof window !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobileDevice(isMobile);

      const hasExt = typeof window !== 'undefined' && Boolean(window.hive_keychain);
      setKeychainInstalled(hasExt);

      // Default to mobile/QR tab on mobile devices or if extension is missing
      if (isMobile || !hasExt) {
        setActiveTab('mobile_qr');
      } else {
        setActiveTab('extension');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenApp = (customUri) => {
    const targetUri = customUri || hasUri;
    if (targetUri && typeof window !== 'undefined') {
      window.location.href = targetUri;
    }
  };

  const handleOpenKeychainBrowser = () => {
    if (typeof window !== 'undefined') {
      const targetUrl = window.location.href;
      window.location.href = `hivekeychain://dapp?url=${encodeURIComponent(targetUrl)}`;
    }
  };

  /**
   * 1. DESKTOP EXTENSION LOGIN FLOW (1-Click)
   */
  const handleExtensionLogin = async (e) => {
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
      setError('Hive Keychain extension was not detected. Please switch to the Mobile & QR tab.');
      return;
    }

    setLoading(true);
    setStatusMessage('Requesting challenge from server...');

    try {
      const challengeRes = await getKeychainChallenge(cleanUser);
      if (!challengeRes?.success || !challengeRes?.challenge) {
        setLoading(false);
        setError(challengeRes?.message || 'Failed to initialize Keychain challenge.');
        return;
      }

      const challenge = challengeRes.challenge;
      setStatusMessage('Please confirm signature request in Hive Keychain...');

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
          setStatusMessage('Verifying cryptographic signature on blockchain...');

          const loginRes = await loginWithKeychainApi({
            username: cleanUser,
            challenge,
            signature,
          });

          if (loginRes?.data?.success) {
            localStorage.setItem('lastHiveUsername', cleanUser);
            if (loginRes.data.token) {
              localStorage.setItem('token', loginRes.data.token);
            }
            setStatusMessage('Authenticated successfully! Entering dashboard...');
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
      console.error('Hive Keychain extension login error:', err);
      setLoading(false);
      setStatusMessage('');
      setError('An error occurred during Keychain sign in. Please try again.');
    }
  };

  /**
   * 2. HYBRID MOBILE & QR CODE LOGIN FLOW (HiveAuth Protocol)
   */
  const handleMobileQrLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setStatusMessage('');

    const cleanUser = hiveUsername.trim().replace(/^@/, '').toLowerCase();
    if (!cleanUser) {
      setError('Please enter your Hive username.');
      return;
    }

    setLoading(true);
    setStatusMessage('Initializing secure HiveAuth session...');

    try {
      // 1. Fetch challenge from server
      const challengeRes = await getKeychainChallenge(cleanUser);
      if (!challengeRes?.success || !challengeRes?.challenge) {
        setLoading(false);
        setError(challengeRes?.message || 'Failed to initialize login challenge.');
        return;
      }

      const serverChallenge = challengeRes.challenge;
      setActiveChallenge(serverChallenge);

      const appMeta = {
        name: 'Ezabay',
        description: 'Ezabay Multi-Chain Exchange & Wallet',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/logo192.png` : undefined,
      };

      const auth = {
        username: cleanUser,
        token: undefined,
        expire: undefined,
        key: undefined,
      };

      const challengeData = {
        key_type: 'posting',
        challenge: serverChallenge,
      };

      hasSessionRef.current = auth;

      // 2. Initiate HiveAuth request
      const ackPromise = hasClient.authenticate(
        auth,
        appMeta,
        challengeData,
        (evt) => {
          if (evt && evt.cmd === 'auth_wait' && evt.uuid && evt.key) {
            const authPayload = {
              account: cleanUser,
              uuid: evt.uuid,
              key: evt.key,
              host: 'wss://hive-auth.arcange.eu/',
            };
            const encoded = btoa(JSON.stringify(authPayload));
            const uri = `has://auth_req/${encoded}`;
            setHasUri(uri);
            setStatusMessage('Waiting for approval in Hive Keychain Mobile...');

            // If on mobile device, automatically attempt to launch the Keychain app!
            if (isMobileDevice) {
              window.location.href = uri;
            }
          }
        }
      );

      // 3. Await approval from Keychain Mobile
      const ack = await ackPromise;

      if (!ack) {
        throw new Error('Authentication was cancelled or expired.');
      }

      setStatusMessage('Approval confirmed! Verifying signature with server...');

      // Extract cryptographic signature returned from Keychain
      const cData = ack.data?.challenge_data || ack.data?.challenge || ack.challenge_data;
      const signature =
        (typeof cData === 'object' ? cData?.challenge || cData?.signature : cData) ||
        ack.data?.signature;

      if (!signature) {
        throw new Error('Signature was not received from mobile wallet.');
      }

      // 4. Send signature to Ezabay server to create/authenticate session
      const loginRes = await loginWithKeychainApi({
        username: cleanUser,
        challenge: serverChallenge,
        signature,
      });

      if (loginRes?.data?.success) {
        localStorage.setItem('lastHiveUsername', cleanUser);
        if (loginRes.data.token) {
          localStorage.setItem('token', loginRes.data.token);
        }
        setStatusMessage('Authenticated successfully! Entering dashboard...');
        dispatch(loginSuccess(loginRes.data));
        dispatch(setCurrency(currenciesList[0]));
        window.location.href = '/dashboard';
      } else {
        setLoading(false);
        setStatusMessage('');
        const failMsg =
          loginRes?.response?.data?.message ||
          loginRes?.data?.message ||
          'Verification failed. Please check your username.';
        setError(failMsg);
      }
    } catch (err) {
      console.error('HiveAuth mobile login error:', err);
      setLoading(false);
      setStatusMessage('');
      setError(
        err?.message || 'Authentication timed out or was rejected in Keychain Mobile.'
      );
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

        <div className="keychain-header">
          <div className="keychain-logo-badge">
            <img src={keychainLogo} alt="Hive Keychain" />
          </div>
          <h2>{initialMode === 'signup' ? 'Sign up with Hive Keychain' : 'Hive Keychain Authentication'}</h2>
          <p className="keychain-subtitle">
            Instant, passwordless Web3 authentication powered by the Hive blockchain.
          </p>
        </div>

        {/* Tab Selector: Extension vs Mobile & QR */}
        <div className="keychain-tab-bar">
          <button
            type="button"
            className={`keychain-tab-btn ${activeTab === 'extension' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('extension');
              setError('');
              setStatusMessage('');
            }}
            disabled={loading}
          >
            <span>⚡ Browser Extension</span>
          </button>
          <button
            type="button"
            className={`keychain-tab-btn ${activeTab === 'mobile_qr' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('mobile_qr');
              setError('');
              setStatusMessage('');
            }}
            disabled={loading}
          >
            <span>📱 Mobile App / QR Code</span>
          </button>
        </div>

        {/* ================= EXTENSION TAB ================= */}
        {activeTab === 'extension' && (
          <div>
            {!keychainInstalled && (
              <div className="keychain-warning-banner">
                <span>Keychain Extension Not Detected</span>
                <p>
                  We could not find the Hive Keychain browser extension on this device.
                </p>
                <button
                  type="button"
                  className="btn-switch-tab"
                  onClick={() => setActiveTab('mobile_qr')}
                >
                  Switch to Mobile App / QR Code &rarr;
                </button>
              </div>
            )}

            <form onSubmit={handleExtensionLogin} className="keychain-form">
              <div className="keychain-input-group">
                <label htmlFor="hiveUsernameExt">Hive Username</label>
                <div className="keychain-input-wrapper">
                  <span className="keychain-at-prefix">@</span>
                  <input
                    id="hiveUsernameExt"
                    type="text"
                    autoFocus
                    disabled={loading}
                    value={hiveUsername}
                    onChange={(e) => setHiveUsername(e.target.value)}
                    placeholder="your-hive-account"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              {statusMessage && (
                <div className="keychain-status-banner">
                  <Spinner />
                  <span>{statusMessage}</span>
                </div>
              )}

              {error && <div className="keychain-error-banner">{error}</div>}

              <div className="keychain-actions">
                <button
                  type="submit"
                  className="btn-keychain-submit"
                  disabled={loading || !hiveUsername.trim()}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span style={{ marginLeft: 8 }}>Signing with Keychain...</span>
                    </>
                  ) : (
                    <span>Continue with Extension &rarr;</span>
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
          </div>
        )}

        {/* ================= MOBILE & QR TAB ================= */}
        {activeTab === 'mobile_qr' && (
          <div className="keychain-mobile-view">
            <div className="keychain-input-group">
              <label htmlFor="hiveUsernameMobile">Hive Username</label>
              <div className="keychain-input-wrapper">
                <span className="keychain-at-prefix">@</span>
                <input
                  id="hiveUsernameMobile"
                  type="text"
                  disabled={loading && !!hasUri}
                  value={hiveUsername}
                  onChange={(e) => {
                    setHiveUsername(e.target.value);
                    if (hasUri) setHasUri('');
                  }}
                  placeholder="your-hive-account"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* QR Code Presentation */}
            {hasUri ? (
              <div className="keychain-qr-section">
                <div
                  className="keychain-qr-wrapper"
                  onClick={() => handleOpenApp(hasUri)}
                  title="Click or tap to open in Hive Keychain Mobile"
                >
                  <div className="keychain-qr-card">
                    <QRCode value={hasUri} size={170} />
                  </div>
                  <div className="keychain-qr-badge">
                    <span>👆 Tap QR code or button below to open Keychain</span>
                  </div>
                </div>

                <div className="keychain-mobile-actions">
                  <button
                    type="button"
                    className="btn-open-keychain-app"
                    onClick={() => handleOpenApp(hasUri)}
                  >
                    <span>📱 Open in Hive Keychain App</span>
                  </button>

                  <button
                    type="button"
                    className="btn-keychain-browser-fallback"
                    onClick={handleOpenKeychainBrowser}
                  >
                    <span>🌐 Open Ezabay in Keychain Browser</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="keychain-qr-prompt">
                <p>
                  Generate an interactive QR code to authenticate with your <strong>Hive Keychain Mobile app</strong>.
                </p>
                <button
                  type="button"
                  className="btn-keychain-submit"
                  disabled={loading || !hiveUsername.trim()}
                  onClick={handleMobileQrLogin}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span style={{ marginLeft: 8 }}>Connecting to HiveAuth...</span>
                    </>
                  ) : (
                    <span>Generate Mobile QR / Pop-up &rarr;</span>
                  )}
                </button>
              </div>
            )}

            {statusMessage && (
              <div className="keychain-status-banner">
                <Spinner />
                <span>{statusMessage}</span>
              </div>
            )}

            {error && <div className="keychain-error-banner">{error}</div>}

            <div className="keychain-mobile-footer-hints">
              <span className="hint-title">Don't have Hive Keychain Mobile?</span>
              <div className="hint-links">
                <a
                  href="https://apps.apple.com/app/hive-keychain/id1552345123"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iOS App Store
                </a>
                <span>•</span>
                <a
                  href="https://play.google.com/store/apps/details?id=com.hivekeychain.mobile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Play
                </a>
              </div>
            </div>

            <div className="keychain-actions" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn-keychain-cancel"
                onClick={onClose}
                disabled={loading && !error}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeychainLoginModal;

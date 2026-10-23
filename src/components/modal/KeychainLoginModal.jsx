import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getKeychainChallenge, loginWithKeychainApi } from '../../api/auth';
import { loginSuccess } from '../../redux/userReducer';
import { setCurrency } from '../../redux/currencySlice';
import { currenciesList } from '../../vairables/protectedRoutes';
import hiveLogo from '../../assets/hive-logo.png';
import Spinner from '../spinner/Spinner';
import './keychain-login-modal.scss';

export const KeychainLoginModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [hiveUsername, setHiveUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [keychainInstalled, setKeychainInstalled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setStatusMessage('');
      setLoading(false);
      const savedUser = localStorage.getItem('lastHiveUsername') || '';
      if (savedUser) {
        setHiveUsername(savedUser);
      }
      const isInstalled = typeof window !== 'undefined' && Boolean(window.hive_keychain);
      setKeychainInstalled(isInstalled);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
            <img src={hiveLogo} alt="Hive" />
          </div>
          <h2>Hive Keychain Login</h2>
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
      </div>
    </div>
  );
};

export default KeychainLoginModal;

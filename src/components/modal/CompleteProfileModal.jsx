import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { completeProfileApi } from '../../api/auth';
import { updateUser } from '../../redux/userReducer';
import { countriesList } from '../../vairables/countries';
import keychainLogo from '../../assets/keychain-logo.png';
import Spinner from '../spinner/Spinner';
import './complete-profile-modal.scss';

export const CompleteProfileModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.ekzaUser?.user);

  const [firstName, setFirstName] = useState(
    user?.firstName && user?.firstName !== user?.hiveUsername ? user.firstName : ''
  );
  const [lastName, setLastName] = useState(
    user?.lastName && user?.lastName !== 'Hive' ? user.lastName : ''
  );
  const [email, setEmail] = useState(
    user?.email && !user?.email.includes('@hive.ezabay.internal') ? user.email : ''
  );
  const [country, setCountry] = useState(user?.country || 'Nigeria');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First Name, Last Name, and Email are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await completeProfileApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        country,
        referralCode: referralCode.trim() || undefined,
      });

      if (res?.success && res?.user) {
        dispatch(updateUser({ user: res.user }));
        toast.success('Profile completed successfully! Welcome to Ezabay.');
        setLoading(false);
        onClose();
      } else {
        setLoading(false);
        setError(res?.message || 'Failed to complete profile. Please try again.');
      }
    } catch (err) {
      console.error('Error completing profile:', err);
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal-backdrop-dismiss" onClick={loading ? undefined : onClose} />
      <div className="modal complete-profile-modal">
        <button
          type="button"
          className="complete-profile-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="complete-profile-header">
          <div className="complete-profile-badge">
            <img src={keychainLogo} alt="Hive Keychain" />
          </div>
          <h2>Complete Your Profile</h2>
          {user?.hiveUsername && (
            <div className="complete-profile-verified-pill">
              <span className="pill-check">&#10003;</span>
              <span>Verified Hive Account: <strong>@{user.hiveUsername}</strong></span>
            </div>
          )}
          <p className="complete-profile-subtitle">
            Just a few details to enable deposit notifications, bank withdrawals & receipts.
          </p>
        </div>

        {error && <div className="complete-profile-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="complete-profile-form">
          <div className="complete-profile-row">
            <div className="complete-profile-input-group">
              <label htmlFor="cpFirstName">First Name</label>
              <input
                id="cpFirstName"
                type="text"
                className="complete-profile-field"
                placeholder="First Name"
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="complete-profile-input-group">
              <label htmlFor="cpLastName">Last Name</label>
              <input
                id="cpLastName"
                type="text"
                className="complete-profile-field"
                placeholder="Last Name"
                disabled={loading}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="complete-profile-input-group">
            <label htmlFor="cpEmail">Email Address</label>
            <input
              id="cpEmail"
              type="email"
              className="complete-profile-field"
              placeholder="name@example.com"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="complete-profile-field-hint">
              Used for fiat/crypto deposit alerts, withdrawal receipts & security notifications.
            </span>
          </div>

          <div className="complete-profile-row">
            <div className="complete-profile-input-group">
              <label htmlFor="cpCountry">Country</label>
              <select
                id="cpCountry"
                className="complete-profile-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={loading}
              >
                {countriesList.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="complete-profile-input-group">
              <label htmlFor="cpReferral">Referral Code (Optional)</label>
              <input
                id="cpReferral"
                type="text"
                className="complete-profile-field"
                placeholder="Referral Code"
                disabled={loading}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
          </div>

          <div className="complete-profile-actions">
            <button
              type="submit"
              className="btn-complete-profile-submit"
              disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim()}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span style={{ marginLeft: 8 }}>Saving Profile...</span>
                </>
              ) : (
                <span>Save & Complete Profile &rarr;</span>
              )}
            </button>
            <button
              type="button"
              className="btn-complete-profile-skip"
              onClick={onClose}
              disabled={loading}
            >
              I'll do this later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;

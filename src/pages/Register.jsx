import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerUser } from '../api/auth';
import Logo from "../assets/Ezabay-logo.png";
import keychainLogo from '../assets/keychain-logo.png';
import Spinner from '../components/spinner/Spinner';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineGlobeAlt, 
  HiOutlineTag,
  HiShieldCheck, 
  HiBolt, 
  HiSparkles 
} from 'react-icons/hi2';
import { GeneralDropdown } from '../components/dropdown/GeneralDrpdpown';
import { toast } from 'react-toastify';
import { countriesList } from '../vairables/countries';
import { KeychainLoginModal } from '../components/modal/KeychainLoginModal';
import './register.scss';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location?.search);
  const referralCodeFromURL = queryParams?.get('referral');

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');
  const [openCountryList, setOpenCountryList] = useState(false);
  const [referralCode, setReferralCode] = useState(referralCodeFromURL || '');
  const [openKeychainModal, setOpenKeychainModal] = useState(false);

  useEffect(() => {
    if (referralCodeFromURL) {
      setReferralCode(referralCodeFromURL);
    }
  }, [referralCodeFromURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        email: email.trim().toLowerCase(),
        password,
        username: username.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: selectedCountry,
        referralCode: referralCode.trim() || undefined,
      };

      const resp = await registerUser(userData);

      if (resp?.success) {
        toast.success(resp.message || 'Account created successfully! Please sign in.');
        navigate('/login');
        setLoading(false);
      } else {
        setError(resp?.message || 'Registration failed. Please check your details.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error registering user:', err);
      const msg = err?.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleCountryChange = (country) => {
    const selectedC = countriesList.find((c) => c === country) || country;
    setSelectedCountry(selectedC);
  };

  const handleOpenList = () => {
    setOpenCountryList(!openCountryList);
  };

  return (
    <div className="auth-page-root register-page-root">
      <div className="auth-container register-container">
        
        {/* Left Side: Brand Showcase & Value Highlights */}
        <div className="auth-showcase">
          <div className="showcase-glow" />
          
          <div className="showcase-brand-header">
            <Link to="/" className="brand-logo-link">
              <img src={Logo} alt="Ezabay Logo" className="showcase-logo" />
            </Link>
            <span className="showcase-pill">
              <span className="live-dot" />
              <span>Free Account</span>
            </span>
          </div>

          <div className="showcase-hero-text">
            <h1>Join the Modern Web3 Exchange</h1>
            <p>
              Open your free Ezabay account today to trade Hive, HBD, Bitcoin, and BEP-20 USDT with direct bank transfers.
            </p>
          </div>

          <div className="showcase-perks-list">
            <div className="showcase-perk-item">
              <div className="perk-icon-wrap hive">
                <HiBolt size={20} />
              </div>
              <div className="perk-text">
                <strong>1-Click Keychain Onboarding</strong>
                <span>Have a Hive account? Sign up instantly without filling forms</span>
              </div>
            </div>

            <div className="showcase-perk-item">
              <div className="perk-icon-wrap security">
                <HiShieldCheck size={20} />
              </div>
              <div className="perk-text">
                <strong>Institutional HD Wallets</strong>
                <span>Dedicated SegWit BTC & BSC BEP-20 addresses auto-generated</span>
              </div>
            </div>

            <div className="showcase-perk-item">
              <div className="perk-icon-wrap speed">
                <HiSparkles size={20} />
              </div>
              <div className="perk-text">
                <strong>Earn EzaPoints Rewards</strong>
                <span>Earn instant rebates and trading discounts on every transfer</span>
              </div>
            </div>
          </div>

          <div className="showcase-footer-stat">
            <div className="stat-pill">
              <span className="stat-num">Fast</span>
              <span className="stat-desc">Verification</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">100%</span>
              <span className="stat-desc">Non-Custodial</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">24/7</span>
              <span className="stat-desc">Support</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card register-card">
            
            {/* Mobile-only logo display */}
            <div className="auth-mobile-logo">
              <Link to="/">
                <img src={Logo} alt="Ezabay Logo" />
              </Link>
            </div>

            <div className="auth-card-header">
              <h2>Create an Account</h2>
              <p>Get started with fast crypto & fiat trading in minutes</p>
            </div>

            {/* 1-Click Hive Keychain Button */}
            <button
              type="button"
              className="keychain-cta-btn"
              onClick={() => setOpenKeychainModal(true)}
            >
              <div className="keychain-cta-icon-wrap">
                <img src={keychainLogo} alt="Hive Keychain" />
              </div>
              <div className="keychain-cta-text">
                <span className="cta-label">Sign up with Hive Keychain</span>
                <span className="cta-sub">Fastest option: 1-click account creation</span>
              </div>
              <span className="cta-arrow">&rarr;</span>
            </button>

            <div className="auth-divider">
              <span>or register with email</span>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="auth-error-banner">
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="auth-form register-form">
              
              {/* First & Last Name: 2 Columns */}
              <div className="form-row-2col">
                <div className="form-field">
                  <label>First Name</label>
                  <div className="input-wrap">
                    <HiOutlineUser className="field-icon" size={18} />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Last Name</label>
                  <div className="input-wrap">
                    <HiOutlineUser className="field-icon" size={18} />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Username & Email: 2 Columns */}
              <div className="form-row-2col">
                <div className="form-field">
                  <label>Username</label>
                  <div className="input-wrap">
                    <HiOutlineUser className="field-icon" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-wrap">
                    <HiOutlineEnvelope className="field-icon" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="your.email@domain.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Country & Referral Code: 2 Columns */}
              <div className="form-row-2col">
                <div className="form-field">
                  <label>Country</label>
                  <div className="country-dropdown-wrap">
                    <GeneralDropdown
                      items={countriesList}
                      setSelectedItem={handleCountryChange}
                      handleOpenList={handleOpenList}
                      openList={openCountryList}
                      itemName={selectedCountry}
                      selectLabal="Country"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Referral Code <span className="label-optional">(Optional)</span></label>
                  <div className="input-wrap">
                    <HiOutlineTag className="field-icon" size={18} />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Referral Code"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password: 2 Columns */}
              <div className="form-row-2col">
                <div className="form-field">
                  <label>Password</label>
                  <div className="input-wrap">
                    <HiOutlineLockClosed className="field-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Confirm Password</label>
                  <div className="input-wrap">
                    <HiOutlineLockClosed className="field-icon" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-spinner-wrap">
                    <Spinner />
                    <span>Creating your account...</span>
                  </div>
                ) : (
                  <span>Complete Registration &rarr;</span>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <span>
                Already have an account?{" "}
                <Link to="/login" className="auth-switch-link">
                  Sign In
                </Link>
              </span>
            </div>

          </div>
        </div>

      </div>

      {openKeychainModal && (
        <KeychainLoginModal
          isOpen={openKeychainModal}
          onClose={() => setOpenKeychainModal(false)}
          initialMode="signup"
          defaultReferral={referralCode}
        />
      )}
    </div>
  );
};

export default Register;

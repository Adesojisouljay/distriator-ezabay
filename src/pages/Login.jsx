import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../api/auth";
import { loginStart, loginSuccess, loginFailure } from "../redux/userReducer";
import { setCurrency } from "../redux/currencySlice";
import { isTokenValid } from "../utils";
import Logo from "../assets/Ezabay-logo.png";
import keychainLogo from "../assets/keychain-logo.png";
import { currenciesList } from "../vairables/protectedRoutes";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiShieldCheck, 
  HiSparkles,
  HiBolt,
  HiCheckBadge
} from "react-icons/hi2";
import { PasswordReset } from "../components/modal/PasswordReset";
import { KeychainLoginModal } from "../components/modal/KeychainLoginModal";
import Spinner from "../components/spinner/Spinner";
import "./login.scss";

export const Login = () => {
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openPasswordResetModal, setOpenPasswordResetModal] = useState(false);
  const [openKeychainModal, setOpenKeychainModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const global = useSelector((state) => state);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isTokenValid(token) && global.ekzaUser?.user) {
      navigate("/dashboard");
    }
  }, [global.ekzaUser?.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userData = {
        password,
        identifier: identifier.trim(),
      };

      dispatch(loginStart());

      const response = await loginUser(userData);
      if (response && response?.data?.success) {
        dispatch(loginSuccess(response.data));
        dispatch(setCurrency(currenciesList[0]));

        window.location.href = "/dashboard";
        setLoading(false);
      } else {
        const errorMsg = response?.response?.data?.message || response?.data?.message || "Invalid email or password";
        setError(errorMsg);
        dispatch(loginFailure(errorMsg));
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      const errorMsg = err?.response?.data?.message || "An error occurred. Please try again later.";
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-container">
        
        {/* Left Side: Brand Showcase & Value Highlights */}
        <div className="auth-showcase">
          <div className="showcase-glow" />
          
          <div className="showcase-brand-header">
            <Link to="/" className="brand-logo-link">
              <img src={Logo} alt="Ezabay Logo" className="showcase-logo" />
            </Link>
            <span className="showcase-pill">
              <span className="live-dot" />
              <span>Multi-Chain Gateway</span>
            </span>
          </div>

          <div className="showcase-hero-text">
            <h1>Trade Crypto & Fiat with Confidence</h1>
            <p>
              Experience ultra-fast, non-custodial settlements for Hive, HBD, Bitcoin, and BEP-20 USDT with instant Nigerian bank withdrawals.
            </p>
          </div>

          <div className="showcase-perks-list">
            <div className="showcase-perk-item">
              <div className="perk-icon-wrap hive">
                <HiBolt size={20} />
              </div>
              <div className="perk-text">
                <strong>1-Click Hive Keychain Login</strong>
                <span>Passwordless Web3 login with your cryptographic keys</span>
              </div>
            </div>

            <div className="showcase-perk-item">
              <div className="perk-icon-wrap security">
                <HiShieldCheck size={20} />
              </div>
              <div className="perk-text">
                <strong>Multi-Chain HD Security</strong>
                <span>Individual SegWit BTC & BSC deposit addresses for every account</span>
              </div>
            </div>

            <div className="showcase-perk-item">
              <div className="perk-icon-wrap speed">
                <HiSparkles size={20} />
              </div>
              <div className="perk-text">
                <strong>Instant Naira Off-Ramp</strong>
                <span>Direct bank account settlements with zero hidden charges</span>
              </div>
            </div>
          </div>

          <div className="showcase-footer-stat">
            <div className="stat-pill">
              <span className="stat-num">0%</span>
              <span className="stat-desc">Deposit Fee</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">Fast</span>
              <span className="stat-desc">Bank Payouts</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">24/7</span>
              <span className="stat-desc">Automated Sweeps</span>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Glass Auth Card */}
        <div className="auth-card-wrapper">
          <div className="auth-card">
            
            {/* Mobile-only logo display */}
            <div className="auth-mobile-logo">
              <Link to="/">
                <img src={Logo} alt="Ezabay Logo" />
              </Link>
            </div>

            <div className="auth-card-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your Ezabay account to manage your portfolio</p>
            </div>

            {/* Official URL Verification Pill */}
            <div className="auth-security-badge">
              <HiShieldCheck size={16} className="shield-icon" />
              <span>Verify URL: <strong>hives.ezabay.com</strong></span>
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
                <span className="cta-label">Sign in with Hive Keychain</span>
                <span className="cta-sub">Instant 1-click passwordless access</span>
              </div>
              <span className="cta-arrow">&rarr;</span>
            </button>

            <div className="auth-divider">
              <span>or sign in with email</span>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="auth-error-banner">
                <span>{error}</span>
              </div>
            )}

            {/* Standard Email / Password Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label>Email or Username</label>
                <div className="input-wrap">
                  <HiOutlineEnvelope className="field-icon" size={18} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => setOpenPasswordResetModal(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-wrap">
                  <HiOutlineLockClosed className="field-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-spinner-wrap">
                    <Spinner />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign In &rarr;</span>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <span>
                Don't have an account?{" "}
                <Link to="/register" className="auth-switch-link">
                  Create an Account
                </Link>
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Modals */}
      {openPasswordResetModal && (
        <PasswordReset
          isOpen={openPasswordResetModal}
          onClose={() => setOpenPasswordResetModal(false)}
        />
      )}

      {openKeychainModal && (
        <KeychainLoginModal
          isOpen={openKeychainModal}
          onClose={() => setOpenKeychainModal(false)}
          initialMode="login"
        />
      )}
    </div>
  );
};

export default Login;

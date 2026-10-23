import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { loginUser } from "../api/auth";
import { loginStart, loginSuccess, loginFailure } from "../redux/userReducer";
import { setCurrency } from "../redux/currencySlice";
import { isTokenValid } from "../utils";
import Logo from "../assets/Ezabay-st-logo.png";
import Secure from "../assets/icons8-secure-64.png"
import hiveLogo from "../assets/hive-logo.png";
import { currenciesList } from "../vairables/protectedRoutes";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { PasswordReset } from "../components/modal/PasswordReset";
import { KeychainLoginModal } from "../components/modal/KeychainLoginModal";
import "./login.scss";
import Spinner from "../components/spinner/Spinner";

const Login = () => {
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [openPasswordResetModal, setOpenPasswordResetModal] = useState(false);
  const [openKeychainModal, setOpenKeychainModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const global = useSelector((state) => state);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isTokenValid(token) && global.ekzaUser.user) {
      navigate("/dashboard");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        password,
        identifier,
      };

      dispatch(loginStart());

      const response = await loginUser(userData);
      if (response && response?.data?.success) {
        dispatch(loginSuccess(response.data));
        dispatch(setCurrency(currenciesList[0]));

        window.location.href = "/dashboard";
        setLoading(false);
      } else {
        setError(response?.response.data?.message);
        dispatch(loginFailure("Invalid email or password"));
        setLoading(false);
      }
    } catch (error) {
      console.log(error)
      setLoading(false);
      dispatch(loginFailure("An error occurred. Please try again later."));
    }
  };

  const openPassword = () => {
    setOpenPasswordResetModal(true)
}

const closePassword = () => {
    setOpenPasswordResetModal(false)
}

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={Logo} alt="" />
      </div>
      <div className="login-right">
      <div className="sign-in-wrap">
        <h1 className="header-text">Sign in to Ezabay</h1>
        <div className="caution-wrap">
          <img src={Secure} alt="" /> <span>Always verify that you are on <span className="securelink">hives.ezabay.com</span></span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            {/* <label>Email</label> */}
            <input
              type={"email" | "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.toLowerCase())}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="login-form-group passwd">
            {/* <label>Password</label> */}
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            {!showPassword ? <FaRegEye 
              className='eye-icon' 
              size={20}
              onClick={() => setShowPassword(!showPassword)}
            /> :
            <FaRegEyeSlash 
              className='eye-icon' 
              size={20}
              onClick={() => setShowPassword(!showPassword)}
            />}
          </div>
          {error && <p className="error-messages">{error}</p>}
          <div className="Forget-Password-wrap">
          <span onClick={openPassword}>Forgot Password</span>
        </div>
          <button
            style={{ cursor: loading && "not-allowed" }}
            className="btn-login"
            disabled={loading}
            type="submit"
          >
            {loading ? (<Spinner/>) : (<span>Login</span>)}
            
          </button>
        </form>
        
        <div className="or-wrap">
          <div className="or-divider">
            <span>or</span>
          </div>
        </div>
        <button
          type="button"
          className="keychain-login-btn"
          onClick={() => setOpenKeychainModal(true)}
        >
          <img src={hiveLogo} alt="Hive" className="hive-btn-icon" />
          <span>Login with Hive Keychain</span>
        </button>
        <div className="reg-link">
          <span>
            Dont't have an account?{" "}
            <Link className="reg-link-reg" to="/register">
              Register
            </Link>
          </span>
        </div>
      </div>
      </div>

      {openPasswordResetModal && 
        <PasswordReset 
          isOpen={openPasswordResetModal} 
          onClose={closePassword}
        />}

      {openKeychainModal && (
        <KeychainLoginModal
          isOpen={openKeychainModal}
          onClose={() => setOpenKeychainModal(false)}
        />
      )}
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerUser } from '../api/auth';
import cat from "../assets/document_shape.webp";
import eth from "../assets/eth-icon.webp";
import './register.scss';
import Logo from "../assets/Ezabay-st-logo.png";
import { Loader } from '../components/loader/Loader';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { GeneralDropdown } from '../components/dropdown/GeneralDrpdpown';
import { toast } from 'react-toastify';
import { countriesList } from '../vairables/countries';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location?.search);
  const referralCodeFromURL = queryParams?.get('referral');

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countries, setCountries] = useState([]); // State to store countries
  const [selectedCountry, setSelectedCountry] = useState("");
  const [openCountryList, setOpenCountryList] = useState(false);
  const [referralCode, setReferralCode] = useState(referralCodeFromURL || '');

  useEffect(() => {
    if (referralCodeFromURL) {
      setReferralCode(referralCodeFromURL);
    }
  }, [referralCodeFromURL]);

  // useEffect(() => {
  //   const fetchCountries = async () => {
  //     try {
  //       const response = await fetch('https://restcountries.com/v3.1/all');
  //       const data = await response.json();
  //       const countryNames = data.map(country => country.name.common).sort();
  //       console.log("response.......", response)
  //       setCountries(countryNames);
  //     } catch (error) {
  //       console.error('Error fetching countries:', error);
  //     }
  //   };
  
  //   fetchCountries();
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false)
      return;
    }

    try {
      const userData = { email, password, username, firstName, lastName, country: selectedCountry, referralCode: referralCode };
      const resp = await registerUser(userData);

      if (resp.success) {
        toast.success(resp.message)
        navigate("/login");
        setLoading(false)
      } else {
        setError(resp.message);
        setLoading(false)
      }
    } catch (error) {
      console.log('Error registering user:', error);
      setError('An unexpected error occurred');
      setLoading(false)
    }
  };

  const handleCountryChange = (country) => {
    const selectedC = countriesList.find(c => c === country);
    setSelectedCountry(selectedC)
  };

  const handleOpenList = () => {
    setOpenCountryList(!openCountryList);
  };

  return (
    <div className="register-container">
      <div className="reg-left">
      <h1 className="header-text">Create Account</h1>
        {loading && <Loader/>}
      <form onSubmit={handleSubmit}>
          <div className="reg-form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.toLowerCase())}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="reg-form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastname(e.target.value.toLowerCase())}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div className="reg-form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="reg-form-group">
            <label>Username</label>
            <input
              className="yep"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="reg-form-group">
            <label>Referral Code (Optional)</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
            />
          </div>
          <div className="reg-form-group">
            <label>Country</label>
            <GeneralDropdown
                  items={countriesList}
                  setSelectedItem={handleCountryChange} 
                  handleOpenList={handleOpenList} 
                  openList={openCountryList}
                  itemName={selectedCountry}
                  selectLabal="country"
                />
          </div>
          
          <div className="reg-form-group passwd">
            <label>Password</label>
            <input
              className="yep"
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
          <div className="reg-form-group passwd">
            <label>Confirm Password</label>
            <input
              className="test"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
            {!showConfirmPassword ? <FaRegEye 
              className='eye-icon' 
              size={20}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            /> :
            <FaRegEyeSlash 
              className='eye-icon' 
              size={20}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />}
          </div>
          {error && <span>{error}</span>}
          <button
            style={{cursor: loading ? "not-allowed" : "pointer"}}
            className="btn-register" 
            type="submit"
            disabled={loading}
            >
              Register
            </button>
        </form>
        <div className="reg-link">
           <span>Already have an account? <Link className="login-span" to="/login">Login</Link></span>
        </div>
      </div>
      <div className="reg-right">
      <img src={Logo} alt="" />
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { persistor } from '../../redux/store';
// import logo from "../../assets/logo-cut.png";
import './navbar.scss';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userReducer';
import { clearCurrency } from '../../redux/currencySlice';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { formatDate, formatString } from '../../utils';
import { PiGreaterThanBold } from 'react-icons/pi';
import { userAvatar } from '../../vairables/protectedRoutes';
import RightNav from './RightNav';
import logo from "../../assets/Ezabay-logo.png";
import ThemeToggle from '../theme/ThemeToggle';

export const NavBar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state?.ekzaUser?.isAuthenticated);
  const user = useSelector(state => state?.ekzaUser?.user);

  const [nav, setNav] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rightNav, setRightNav] = useState(false)

  const handleNav = () => {
    setNav(!nav);
  };

  const handleRightNav = ()=>{
    setRightNav(!rightNav)
  }

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    dispatch(clearCurrency());
     localStorage.removeItem("token")
    //  window.location.href = '/';
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            {isAuthenticated && (
              <button className="menu-toggle-btn" onClick={handleRightNav} aria-label="Open sidebar menu">
                <AiOutlineMenu size={20} />
              </button>
            )}

            <Link to="/" className="brand-link">
              <div className="logo">
                <img src={logo} alt="Ezabay" />
              </div>
            </Link>
          </div>

          <div className="nav-right">
            <ThemeToggle variant="icon" />
            {isAuthenticated ? (
              <Link to="/profile" className="user-profile-pill">
                <img 
                  className="user-avatar"
                  src={user?.profileImage || userAvatar}
                  alt={user?.username || "User"}
                />
                <div className="user-details">
                  <span className="user-name">{user?.username}</span>
                  {user?.role && (
                    <span className={`user-role-badge ${user?.role}`}>
                      {user.role}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Log In</Link>
                <Link to="/register" className="btn-register">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {isAuthenticated && (
        <RightNav rightNav={rightNav} handleRightNav={handleRightNav} handleLogout={handleLogout} />
      )}
    </>
  );
};

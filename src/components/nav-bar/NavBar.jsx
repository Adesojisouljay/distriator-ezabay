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
import { toggleSidebar, toggleMobileSidebar } from '../../redux/sidebarSlice';

export const NavBar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state?.ekzaUser?.isAuthenticated);
  const user = useSelector(state => state?.ekzaUser?.user);
  const isCollapsed = useSelector(state => state?.sidebar?.isCollapsed ?? false);

  const handleToggle = () => {
    if (window.innerWidth < 768) {
      dispatch(toggleMobileSidebar());
    } else {
      dispatch(toggleSidebar());
    }
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    dispatch(logout());
    dispatch(clearCurrency());
    localStorage.removeItem("token");
    window.location.href = '/';
  };

  return (
    <>
      <nav className={`navbar ${isAuthenticated ? (isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded') : ''}`}>
        <div className="nav-content">
          <div className="nav-left">
            {isAuthenticated && (
              <button
                className="menu-toggle-btn"
                onClick={handleToggle}
                aria-label="Toggle sidebar menu"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
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
        <RightNav />
      )}
    </>
  );
};

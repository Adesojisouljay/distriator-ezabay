import React from 'react';
import './rightnav.scss';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, closeMobileSidebar } from '../../redux/sidebarSlice';
import { logout } from '../../redux/userReducer';
import { clearCurrency } from '../../redux/currencySlice';
import { AiOutlineMenu } from 'react-icons/ai';
import { IoClose, IoLogoSlack } from 'react-icons/io5';
import { FaWallet } from 'react-icons/fa';
import { RiDashboardLine, RiExchangeLine } from 'react-icons/ri';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import ThemeToggle from '../theme/ThemeToggle';
import logo from '../../assets/Ezabay-logo.png';
import { userAvatar } from '../../vairables/protectedRoutes';

export const RightNav = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state?.ekzaUser?.user);
  const isAuthenticated = useSelector((state) => state?.ekzaUser?.isAuthenticated);
  const isCollapsed = useSelector((state) => state?.sidebar?.isCollapsed ?? false);
  const isMobileOpen = useSelector((state) => state?.sidebar?.isMobileOpen ?? false);

  if (!isAuthenticated) return null;

  const menuLinks = [
    { logo: <RiDashboardLine size={21} />, text: 'Dashboard', path: '/dashboard' },
    { logo: <FaWallet size={19} />, text: 'Wallet', path: '/wallet' },
    { logo: <RiExchangeLine size={21} />, text: 'Transactions', path: '/transactions' },
    { logo: <IoLogoSlack size={20} />, text: 'Create Hive Account', path: '/hive-onboard' },
    { logo: <CgProfile size={21} />, text: 'Profile', path: '/profile' },
  ];

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    dispatch(logout());
    dispatch(clearCurrency());
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      dispatch(closeMobileSidebar());
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`mobile-sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={() => dispatch(closeMobileSidebar())}
      />

      <aside
        className={`ezabay-sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* ========================================================= */}
        {/* COLLAPSED MINI-RAIL VIEW (Matches User's 2nd Screenshot) */}
        {/* ========================================================= */}
        <div className="sidebar-rail-inner">
          {/* Top Toggle Button (Rounded with focused border) */}
          <div className="rail-top">
            <button
              type="button"
              className="btn-rail-toggle"
              onClick={() => dispatch(toggleSidebar())}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <AiOutlineMenu size={20} />
            </button>
          </div>

          {/* Centered Navigation Icons */}
          <nav className="rail-nav">
            <ul className="rail-menu">
              {menuLinks.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <li key={item.path} className="rail-item-wrap">
                    <Link
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`rail-link ${isActive ? 'active' : ''}`}
                      data-tooltip={item.text}
                    >
                      <div className="rail-icon-box">{item.logo}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Rail Actions */}
          <div className="rail-bottom">
            <div className="rail-divider" />
            <button
              type="button"
              className="btn-rail-logout"
              onClick={handleLogout}
              title="Log Out"
              data-tooltip="Log Out"
              aria-label="Log out"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXPANDED FULL SIDEBAR VIEW (Open By Default)             */}
        {/* ========================================================= */}
        <div className="sidebar-expanded-inner">
          {/* Header with Logo & Collapse Toggle */}
          <div className="sidebar-header">
            <Link to="/" onClick={handleLinkClick} className="sidebar-brand-link">
              <img src={logo} alt="Ezabay" className="sidebar-logo" />
            </Link>
            <button
              type="button"
              className="btn-sidebar-collapse"
              onClick={() => {
                if (window.innerWidth < 768) {
                  dispatch(closeMobileSidebar());
                } else {
                  dispatch(toggleSidebar());
                }
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <AiOutlineMenu size={18} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="rightnav-profile">
            <img
              className="user-avatar"
              src={user?.profileImage || userAvatar}
              alt={user?.username || 'Avatar'}
            />
            <div className="user-info-section">
              <div className="user-name-row">
                <h4>{user?.username}</h4>
                {user?.role && (
                  <span className={`role-tag ${user.role}`}>{user.role}</span>
                )}
              </div>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="sidebar-nav-section">
            <span className="section-label">Navigation</span>
            <ul className="sidebar-menu">
              {menuLinks.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`menu-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="icon-wrap">{item.logo}</span>
                      <span className="tab-title">{item.text}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer with Appearance, Resources & Logout */}
          <div className="sidebar-footer">
            <div className="theme-switcher-section">
              <span className="section-label">Appearance</span>
              <ThemeToggle variant="segmented" />
            </div>

            <div className="external-links">
              <span className="section-label">Resources</span>
              <a
                className="resource-link"
                href="https://hive.blog/hive-106130/@thedistriator/distriator-the-new-auto-cashback-reward-app-for-spending-in-bitcoin-lighting-and-hive-dollars"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn About Distriator
              </a>
              <a
                className="resource-link"
                href="https://distriator.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Distriator.com
              </a>
            </div>

            <button type="button" className="btn-sidebar-logout" onClick={handleLogout}>
              <FiLogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default RightNav;
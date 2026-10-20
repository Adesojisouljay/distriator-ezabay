import React from 'react'
import "./rightnav.scss"
import { IoClose, IoLogoSlack } from 'react-icons/io5'
import { FaTachometerAlt, FaWallet } from 'react-icons/fa'
import { useSelector } from 'react-redux';
import { formatString } from '../../utils';
import { Link } from 'react-router-dom';
import { userAvatar } from '../../vairables/protectedRoutes';
import { FiLogOut } from 'react-icons/fi';
import { IoIosApps } from 'react-icons/io';
import { PiHandDeposit, PiHandWithdraw } from 'react-icons/pi';
import { RiDashboardLine, RiExchangeLine } from 'react-icons/ri';
import { CgProfile } from 'react-icons/cg';
import ThemeToggle from '../theme/ThemeToggle';
import logo from '../../assets/Ezabay-logo.png';

function RightNav({ rightNav, handleRightNav, handleLogout }) {
  // const isAuthenticated = useSelector(state => state?.ekzaUser?.isAuthenticated);
  const user = useSelector(state => state?.ekzaUser?.user);

  const menuLinks = [
    { logo: <RiDashboardLine size={20} />, text: "Dashboard", path: "/dashboard" },
    { logo: <FaWallet size={19} />, text: "Wallet", path: "/wallet" },
    { logo: <RiExchangeLine size={20} />, text: "Transactions", path: "/transactions" },
    { logo: <IoLogoSlack size={20} />, text: "Create Hive Account", path: "/hive-onboard" },
    { logo: <CgProfile size={20} />, text: "Profile", path: "/profile" },
  ];

  return (
    <div className={`rightnav-layer ${rightNav ? "opennn" : "closed"}`} onClick={handleRightNav}>
      <div className="rightnav-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <Link to="/" onClick={handleRightNav} className="sidebar-brand-link">
            <img src={logo} alt="Ezabay" className="sidebar-logo" />
          </Link>
          <button className="close-btn" onClick={handleRightNav} aria-label="Close menu">
            <IoClose size={22} />
          </button>
        </div>

        <div className="rightnav-profile">
          <img 
            className="user-avatar"
            src={user?.profileImage || userAvatar}
            alt={user?.username || "Avatar"} 
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

        <div className="sidebar-nav-section">
          <span className="section-label">Navigation</span>
          <ul className="sidebar-menu">
            {menuLinks.map((data) => (
              <li key={data.path}>
                <Link to={data.path} onClick={handleRightNav} className="menu-link">
                  <span className="icon-wrap">{data.logo}</span>
                  <span className="tab-title">{data.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

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

          <button className="btn-sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RightNav
import React from 'react'
import "./rightnav.scss"
import { IoClose } from 'react-icons/io5'
import { FaCogs, FaEnvelope, FaHome, FaIdCard, FaSpinner, FaTachometerAlt, FaUser, FaWallet } from 'react-icons/fa'
import { useSelector } from 'react-redux';
import { formatString } from '../../utils';
import { Link } from 'react-router-dom';
import { MdOutlineVerified, MdPending, MdVerified } from 'react-icons/md';
import { userAvatar } from '../../vairables/protectedRoutes';
import { FiLogOut } from 'react-icons/fi';

function RightNav({ rightNav, handleRightNav, handleLogout }) {
  // const isAuthenticated = useSelector(state => state?.ekzaUser?.isAuthenticated);
  const user = useSelector(state => state?.ekzaUser?.user);

  const menuLinks = [
    // { logo: <FaHome size={25} />, text: "Home", path: "/" },
    { logo: <FaTachometerAlt size={20} />, text: "Dashboard", path: "/dashboard" },
    { logo: <FaTachometerAlt size={20} />, text: "Create Hive Account", path: "/hive-onboard" },
    { logo: <FaTachometerAlt size={20} />, text: "Spend HBD", path: "/spend-hbd" },
    // { logo: <FaTachometerAlt size={20} />, text: "Wallet", path: "/wallet" }, 
    // { logo: <FaTachometerAlt size={20} />, text: "Transactions", path: "/transactions" },
    // { logo: <FaSpinner size={20} />, text: "Spinner", path: "/spinner" },
    // { logo: <FaEnvelope size={20} />, text: "Contact", path: "/contact" },
    // { logo: <FaUser size={20} />, text: "Profile", path: "/profile" },
    // { logo: <FaCogs size={20} />, text: "Settings", path: "/settings" },
    // { logo: <FaWallet size={20} />, text: "Accounts", path: "/accounts" },
    // { logo: <FaIdCard size={20} />, text: "KYC", path: "/kyc" }
  ];

  return (
    <div className={`rightnav-layer ${rightNav ? "opennn" : "closed"}`} >
      <div className="right-nav-container"></div>
      <div className="rightnav-wrap" >
        <div className="close-add-btn" onClick={handleRightNav}>
          <IoClose size={20} />
        </div>
        <div className="rightnav-profile">
          <img className='user-avatar'
            src={user?.profileImage || userAvatar}
            alt="" 
          />
          <div className="user-info-section">
            <div className="welcom-wrap"><span>Welcome</span><h4>{user?.username}</h4></div>

            <span>Email: {user?.email}</span>
            {/* {user?.kyc?.kycStatus === "Verified" ? <div className="verified-wrap"><span> {user?.kyc?.kycStatus} </span> <MdVerified size={20} color='green' /></div> :
            <div className="pending-wrap"><span> {user?.kyc?.kycStatus} </span> <MdPending size={20} color='orange' /></div>} */}
          </div>
        </div>
        {/* <hr className='divide-line'/> */}

        <ul>
          {menuLinks.map((data) => (
            <Link to={data.path} onClick={handleRightNav}>
              <li style={{backgroundColor: "red"}}>
                <span className='icon-wrap' >
                  <span>
                    {data.logo}
                  </span>
                </span>
                <span className='tab-title'>
                  {data.text}
                </span>
              </li>
            </Link>
          ))}
        </ul>
        <div style={{display: "flex", flexDirection: "column", marginTop: "20px", gap: "10px"}}>
          <div className="logout-wrap">
            <h3>
              <a 
              style={{cursor: "pointer"}}
              href="https://hive.blog/hive-106130/@thedistriator/distriator-the-new-auto-cashback-reward-app-for-spending-in-bitcoin-lighting-and-hive-dollars" 
              target="_blank" 
              rel="noopener noreferrer">
                Learn about distriator
              </a>
            </h3>
          </div>
          <div className="logout-wrap">
            <h3>
              <a 
              style={{cursor: "pointer"}}
              href="https://distriator.com/" 
              target="_blank" 
              rel="noopener noreferrer">
                Go to distriator.com
              </a>
            </h3>
          </div>
          <div className="logout-wrap">
            <h3>
              <a 
              style={{cursor: "pointer"}}
              href="https://spendhbd.com/" 
              target="_blank" 
              rel="noopener noreferrer">
                Go to spendhbd.com
              </a>
            </h3>
          </div>
          <div className="logout-wrap" onClick={handleLogout}>
            <h3>Logout</h3>
          <Link to="/"><FiLogOut   className='bold-icon'/></Link>
          </div>
        </div>


      </div>
    </div>
  )
}

export default RightNav
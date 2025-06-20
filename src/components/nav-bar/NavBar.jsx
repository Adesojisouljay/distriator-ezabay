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
import logo from "../../assets/Ezabay-logo.png"

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
        <Link to={"/"}><div className="logo">
          <img src={logo} alt="" />
        </div></Link>

        {/* {(isAuthenticated && user?.role !== "user") && <div className='merchant-btn-wrapper'>
          <Link to={"/fiat-deposit-action"}><button className="merchant-btn">Deposit</button></Link>
          <Link to={"fiat-withdrawal-action"}><button className="merchant-btn">Withdrawal</button></Link>
          <Link to={"/kyc-action"}><button className="merchant-btn">Kyc Actions</button></Link>
        </div>} */}

        <div className="login-toggle-wrap">
          {isAuthenticated ? (
            <div className='avatar-container'>
              {!rightNav && <div className="user-top-info" >
                <span>{user.username}</span>
                <img 
                  className='user-avatar'
                  src={user?.profileImage || userAvatar}
                  onClick={handleRightNav}
                />
              </div>}
              <div className='nav-menu-wrap'>
                <AiOutlineMenu className='left-arrow-icon' onClick={handleRightNav}  />
              </div>
            </div>
          ) : (
            <Link to="/login"><span className="login-btn btn-primary">Login</span></Link>
          )}
        </div>        
      </div>
    </nav>
    {isAuthenticated && <RightNav rightNav={rightNav } handleRightNav={handleRightNav} handleLogout={handleLogout}/>}
    </>
  );
};

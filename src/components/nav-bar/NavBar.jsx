import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { persistor } from '../../redux/store';
import logo from "../../assets/logo-cut.png";
import './navbar.scss';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userReducer';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { formatDate, formatString } from '../../utils';
import { PiGreaterThanBold } from 'react-icons/pi';
import { userAvatar } from '../../vairables/protectedRoutes';
import RightNav from './RightNav';

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
    ///////WE WILL REFACTORE ENTIRE NAVBAR WHEN KESOLINK IS BACK
    <>
    <nav className="navbar">
      <div className="nav-content">
        <div className="logo">
          <img src={logo} alt="" />
          <div className="project-name">
            <p>Ekza</p>
            <p>Trade</p>
          </div>
        </div>

        <div className="login-toggle-wrap">
          {isAuthenticated ? (
            <div className='avatar-container'>
              {!rightNav && <div className="user-top-info" >
                <span>{user.username}</span>
                <img 
                  className='user-avatar'
                  src={user.profileImage || userAvatar}
                  onClick={handleRightNav}
                />
              </div>}
              <div className='nav-menu-wrap'>
                <AiOutlineMenu className='left-arrow-icon' onClick={handleRightNav}  />
              </div>
            </div>
          ) : (
            <Link to="/login"><span className="login-btn">Login</span></Link>
          )}
        </div>        
      </div>
    </nav>
    {isAuthenticated && <RightNav rightNav={rightNav } handleRightNav={handleRightNav} handleLogout={handleLogout}/>}
    </>
  );
};

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  HiArrowLeft, 
  HiCamera, 
  HiCheckBadge, 
  HiOutlineEnvelope, 
  HiOutlineUser, 
  HiOutlineIdentification, 
  HiOutlineBuildingLibrary, 
  HiOutlineKey, 
  HiPlus, 
  HiTrash, 
  HiSparkles,
  HiCalendarDays,
  HiCheck,
  HiOutlineWallet
} from 'react-icons/hi2';
import { FaRegCopy } from 'react-icons/fa';

import { PasswordReset } from '../components/modal/PasswordReset';
import { AddAccount } from '../components/modal/AddAccount';
import { ConfirmModal } from '../components/modal/ConfirmModal';
import { deleteBankAccount, updateProfile } from '../api/ekzat';
import { getUserProfile } from '../api/profile';
import { currenciesList, userAvatar } from '../vairables/protectedRoutes';
import { setCurrency } from '../redux/currencySlice';
import { formatNumberWithCommas } from '../utils';
import ThemeToggle from '../components/theme/ThemeToggle';
import './profile.scss';

export const Profile = () => {
  const global = useSelector((state) => state.ekzaUser);
  const selectedCurrency = useSelector((state) => state.currency.selectedCurrency);
  const user = global?.user;
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);

  const [userProfileImage, setUserProfileImage] = useState(null);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [openDeleteAcc, setOpenDeleteAcc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const appBaseUrl = window.location.origin;
  const userReferralLink = `${appBaseUrl}/register?referral=${user?.userMemo || ''}`;

  const isUsd = selectedCurrency?.name === 'USD' || selectedCurrency?.country === 'Usa' || selectedCurrency === 'USD';

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName || 'Item'} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCurrencyChange = (currName) => {
    const matched = currenciesList.find((c) => c.name === currName) || {
      name: currName,
      sign: currName === 'USD' ? '$' : '₦',
      country: currName === 'USD' ? 'Usa' : 'Nigeria',
    };
    dispatch(setCurrency(matched));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUserProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelImageUpload = () => {
    setUserProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProfilePicture = async () => {
    if (!userProfileImage) return;
    setUploadingImage(true);
    try {
      const profileFormData = new FormData();
      profileFormData.append('file', userProfileImage);
      profileFormData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PRESET);

      const response2 = await axios.post(process.env.REACT_APP_CLOUDINARY_URL, profileFormData);
      const profileImage = response2.data.secure_url;
      const dataToUpdate = { profileImage };
      const response = await updateProfile(dataToUpdate);

      if (response.success) {
        toast.success('Profile picture updated successfully!');
        await getUserProfile(dispatch);
        setUserProfileImage(null);
      } else {
        toast.error(response?.message || 'Failed to update profile picture.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while uploading profile photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteAccountClick = (id) => {
    setAccountId(id);
    setOpenDeleteAcc(true);
  };

  const deleteAcc = async () => {
    setLoading(true);
    try {
      const data = await deleteBankAccount(accountId);
      if (data.success) {
        toast.success('Bank account deleted successfully.');
        await getUserProfile(dispatch);
        setOpenDeleteAcc(false);
      } else {
        toast.error(data?.message || 'Failed to delete bank account.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while deleting account.');
    } finally {
      setLoading(false);
    }
  };

  const kycStatus = user?.kyc?.kycStatus || 'unverified';

  return (
    <div className="profile-page-root">
      <div className="profile-page-wrapper">
        
        {/* Breadcrumb Navigation */}
        <div className="profile-breadcrumb">
          <Link to="/dashboard" className="back-link">
            <HiArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <span className="separator">/</span>
          <span className="current">Account Profile</span>
        </div>

        {/* Hero Identity Card */}
        <div className="profile-hero-card">
          <div className="hero-banner-glow"></div>
          
          <div className="hero-content">
            <div className="avatar-wrapper">
              <img
                src={userProfileImage || user?.profileImage || userAvatar}
                alt="Profile Avatar"
                className="profile-avatar-img"
              />
              <button
                type="button"
                className="avatar-edit-badge"
                onClick={handleAvatarClick}
                title="Change Profile Photo"
              >
                <HiCamera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <div className="identity-text-wrap">
              <div className="name-role-row">
                <h2>{`${user?.firstName || ''} ${user?.lastName || ''} ${user?.otherName || ''}`.trim() || user?.username || 'Ezabay Trader'}</h2>
                <span className={`role-badge ${user?.role || 'user'}`}>
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'merchant' ? 'Verified Merchant' : 'Verified Member'}
                </span>
              </div>

              <div className="user-meta-row">
                <span className="username-tag">
                  @{user?.username || 'user'}
                  <button
                    type="button"
                    className="copy-mini-btn"
                    onClick={() => handleCopyText(`@${user?.username}`, 'Username')}
                    title="Copy Username"
                  >
                    {copiedField === 'Username' ? <HiCheck size={13} className="text-success" /> : <FaRegCopy size={12} />}
                  </button>
                </span>

                <span className="joined-date">
                  <HiCalendarDays size={14} />
                  <span>
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}
                  </span>
                </span>
              </div>

              {/* Photo Upload Actions when a file is selected */}
              {userProfileImage && (
                <div className="avatar-upload-actions">
                  <span className="upload-note">New photo selected:</span>
                  <button
                    type="button"
                    className="avatar-save-btn"
                    onClick={uploadProfilePicture}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Save New Photo'}
                  </button>
                  <button
                    type="button"
                    className="avatar-cancel-btn"
                    onClick={cancelImageUpload}
                    disabled={uploadingImage}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="profile-quick-stats">
            <Link to="/wallet" className="stat-box clickable" title="View Wallet">
              <div className="stat-icon-wrap">
                <HiOutlineWallet size={18} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Portfolio</span>
                <span className="stat-value">
                  {isUsd
                    ? `$${formatNumberWithCommas(user?.totalUsdValue || 0)}`
                    : `₦${formatNumberWithCommas(user?.totalNairaValue || 0)}`}
                </span>
              </div>
            </Link>

            <div className="stat-box">
              <div className="stat-icon-wrap points">
                <HiSparkles size={18} />
              </div>
              <div className="stat-info">
                <span className="stat-label">EzaPoints</span>
                <span className="stat-value">{user?.ezaPoints?.balance || 0} pts</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrap kyc">
                <HiCheckBadge size={18} />
              </div>
              <div className="stat-info">
                <span className="stat-label">KYC Status</span>
                <span className={`stat-value kyc-badge ${kycStatus}`}>
                  {kycStatus === 'verified' ? 'Verified' : kycStatus === 'pending' ? 'Pending' : 'Tier 1'}
                </span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-wrap bank">
                <HiOutlineBuildingLibrary size={18} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Linked Banks</span>
                <span className="stat-value">{user?.accounts?.length || 0} Accounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: 2 Columns */}
        <div className="profile-layout-grid">
          
          {/* Left Column: Account Details, Preferences, Security */}
          <div className="profile-grid-column">
            
            {/* Account Information Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <HiOutlineUser className="card-header-icon" size={20} />
                  <h3>Account Information</h3>
                </div>
              </div>

              <div className="card-body">
                <div className="info-field">
                  <span className="field-label">Full Legal Name</span>
                  <div className="field-value-box">
                    <span>{`${user?.firstName || ''} ${user?.lastName || ''} ${user?.otherName || ''}`.trim() || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-field">
                  <span className="field-label">Email Address</span>
                  <div className="field-value-box with-badge">
                    <div className="field-text-group">
                      <HiOutlineEnvelope size={16} className="field-icon" />
                      <span>{user?.email || 'N/A'}</span>
                    </div>
                    <span className="verified-pill">Verified</span>
                  </div>
                </div>

                <div className="info-field">
                  <span className="field-label">Account Memo / Referral ID</span>
                  <div className="field-value-box copyable" onClick={() => handleCopyText(user?.userMemo, 'Memo ID')}>
                    <div className="field-text-group">
                      <HiOutlineIdentification size={16} className="field-icon" />
                      <span className="monospace">{user?.userMemo || 'N/A'}</span>
                    </div>
                    <button type="button" className="copy-action-btn">
                      {copiedField === 'Memo ID' ? <HiCheck size={14} className="text-success" /> : <FaRegCopy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance & Preferences Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <HiSparkles className="card-header-icon" size={20} />
                  <h3>Preferences & Appearance</h3>
                </div>
              </div>

              <div className="card-body">
                <div className="pref-row">
                  <div className="pref-label-wrap">
                    <span className="pref-title">Theme / Mode</span>
                    <span className="pref-desc">Switch between obsidian dark and clean light modes</span>
                  </div>
                  <div className="pref-control-wrap">
                    <ThemeToggle variant="segmented" />
                  </div>
                </div>

                <div className="pref-row">
                  <div className="pref-label-wrap">
                    <span className="pref-title">Default Currency</span>
                    <span className="pref-desc">Display portfolio and token values in NGN or USD</span>
                  </div>
                  <div className="pref-control-wrap">
                    <div className="currency-pill-selector">
                      <button
                        type="button"
                        className={`curr-btn ${!isUsd ? 'active' : ''}`}
                        onClick={() => handleCurrencyChange('NGN')}
                      >
                        NGN (₦)
                      </button>
                      <button
                        type="button"
                        className={`curr-btn ${isUsd ? 'active' : ''}`}
                        onClick={() => handleCurrencyChange('USD')}
                      >
                        USD ($)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Password Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <HiOutlineKey className="card-header-icon" size={20} />
                  <h3>Security & Password</h3>
                </div>
              </div>

              <div className="card-body">
                <div className="security-action-row">
                  <div className="sec-info">
                    <span className="sec-title">Account Password</span>
                    <span className="sec-desc">Ensure your account uses a strong, unique password</span>
                  </div>
                  <button
                    type="button"
                    className="change-password-btn"
                    onClick={() => setOpenPasswordModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Bank Accounts & Referral Program */}
          <div className="profile-grid-column">
            
            {/* Linked Bank Accounts Card */}
            <div className="profile-card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <HiOutlineBuildingLibrary className="card-header-icon" size={20} />
                  <h3>Linked Bank Accounts</h3>
                </div>
                <button
                  type="button"
                  className="card-action-btn primary"
                  onClick={() => setOpenAccountModal(true)}
                >
                  <HiPlus size={15} />
                  <span>Add Account</span>
                </button>
              </div>

              <div className="card-body">
                {user?.accounts && user.accounts.length > 0 ? (
                  <div className="bank-accounts-list">
                    {user.accounts.map((account, index) => (
                      <div className="bank-account-card" key={account.id || index}>
                        <div className="bank-card-icon-wrap">
                          <HiOutlineBuildingLibrary size={22} />
                        </div>
                        <div className="bank-card-details">
                          <span className="bank-name">{account.bankName}</span>
                          <span className="account-number monospace">{account.accountNumber}</span>
                          <span className="account-holder">{account.accountName}</span>
                        </div>
                        <button
                          type="button"
                          className="delete-account-btn"
                          onClick={() => handleDeleteAccountClick(account.id)}
                          title="Delete Bank Account"
                        >
                          <HiTrash size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-bank-state">
                    <HiOutlineBuildingLibrary size={32} className="empty-icon" />
                    <h4>No Bank Accounts Linked</h4>
                    <p>Add your Nigerian bank account for seamless fiat deposits and instant withdrawals.</p>
                    <button
                      type="button"
                      className="add-first-bank-btn"
                      onClick={() => setOpenAccountModal(true)}
                    >
                      <HiPlus size={16} />
                      <span>Link Your First Bank Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Referral Program & Rewards Card */}
            <div className="profile-card referral-card">
              <div className="card-header">
                <div className="card-title-wrap">
                  <HiSparkles className="card-header-icon" size={20} />
                  <h3>Referral Program & Rewards</h3>
                </div>
                <span className="referral-rate-badge">Earn EzaPoints</span>
              </div>

              <div className="card-body">
                <p className="referral-instructions">
                  Share your unique referral link with fellow crypto traders. Earn instant <strong>EzaPoints</strong> and rebate vouchers on every trade they complete!
                </p>

                <div className="referral-link-box">
                  <span className="ref-url monospace">{userReferralLink}</span>
                  <button
                    type="button"
                    className="copy-ref-btn"
                    onClick={() => handleCopyText(userReferralLink, 'Referral Link')}
                  >
                    {copiedField === 'Referral Link' ? (
                      <>
                        <HiCheck size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaRegCopy size={14} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="referral-perks-grid">
                  <div className="perk-item">
                    <span className="perk-number">10%</span>
                    <span className="perk-label">Trading Fee Share</span>
                  </div>
                  <div className="perk-item">
                    <span className="perk-number">Instant</span>
                    <span className="perk-label">EzaPoints Credit</span>
                  </div>
                  <div className="perk-item">
                    <span className="perk-number">Zero</span>
                    <span className="perk-label">Earning Limits</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      {openAccountModal && (
        <AddAccount
          isOpen={openAccountModal}
          onClose={() => setOpenAccountModal(false)}
        />
      )}

      {openPasswordModal && (
        <PasswordReset
          isOpen={openPasswordModal}
          onClose={() => setOpenPasswordModal(false)}
          propsEmail={user?.email}
        />
      )}

      {openDeleteAcc && (
        <ConfirmModal
          isOpen={openDeleteAcc}
          onClose={() => setOpenDeleteAcc(false)}
          func={deleteAcc}
          loading={loading}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBankAccount, deleteBankAccount } from '../../api/ekzat';
import { getUserProfile } from '../../api/profile';
import { Loader } from '../../components/loader/Loader';
import './add-account.scss';

export const AddAccount = ({ isOpen, onClose }) => {
  const user = useSelector(state => state.ekzaUser.user);
  const dispatch = useDispatch();
  console.log(user.accounts)

  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const validateForm = () => {
    const accountNumberRegex = /^\d{10,12}$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!accountNumberRegex.test(accountNumber)) {
      setMessage('Invalid account number. It should be between 10 and 12 digits.');
      return;
    }
    if (!nameRegex.test(accountName)) {
      setMessage('Invalid account name. It should only contain letters and spaces.');
      return false;
    }
    if (!nameRegex.test(bankName)) {
      setMessage('Invalid bank name. It should only contain letters and spaces.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    if (!validateForm()) {
        setLoading(false);
        return;
    }

    const bankDetails = {
      accountNumber,
      accountName,
      bankName
    };

    try {
      await addBankAccount(bankDetails);
      getUserProfile(dispatch)
      setIsSuccess(true);
      setMessage('Bank account added successfully');
      setAccountNumber("")
      setBankName("")
      setAccountName("")
      setLoading(false)
      setMessage('');
    } catch (error) {
      setIsSuccess(false);
      setMessage('Error adding bank account');
      setLoading(false)
    }
  };


  //////we can import this in the profile page and use it later
  const deleteAccount = async (id)=> {
    setDeleting(true)
    try {
      const data = await deleteBankAccount(id);
      console.log(data)
      getUserProfile(dispatch)
      setDeleting(false)
    } catch (error) {
      console.log(error)
      setDeleting(false)
    }
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`modal-overlay  ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
        <div className="modal">
        <span className="close-modal" onClick={onClose}>X</span>
        <div className="account-form-container">
            {isSuccess ? (
            <div className="success-message">
                <h2>Bank Account added successfully!</h2>
                <p>{message}</p>
                <button className='account-button' onClick={onClose}>Go back</button>
            </div>
            ) : (
            <>
            {loading && <Loader/>}
                <form onSubmit={handleSubmit} className="bank-form">
                <div className="account-form-group">
                    <h1 style={{color: "green"}}>Add New Bank Account</h1>
                    {message && <span className='warning'>{message}</span>}
                    <h5 className='warning'>Please make sure you enter your details as accurately as possible</h5>
                    <div className="account-form-group">
                        <label className="account-label">Account Number:</label>
                        <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                        className="account-input"
                        />
                    </div>
                    </div>
                    <div className="account-form-group">
                        <label className="account-label">Account Name:</label>
                        <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        required
                        className="account-input"
                        />
                    </div>
                    <div className="account-form-group">
                        <label className="account-label">Bank Name:</label>
                        <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                        className="account-input"
                        />
                    </div>
                    <button type="submit" className="account-button">Add Bank Account</button>
                </form>
            </>
            )}
        </div>
        </div>
    </div>
  );
};

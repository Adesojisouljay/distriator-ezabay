import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { requestWithdrawalToken, requestFiatWithdrawal } from '../../api/ekzat';
import { getUserProfile } from '../../api/profile';
import { Link } from 'react-router-dom';
import { GeneralDropdown } from '../dropdown/GeneralDrpdpown';
import './fiat-withdrawal.scss';

export const FiatWithdrawalModal = ({ isOpen, onClose }) => {
  const user = useSelector(state => state?.ekzaUser?.user);
  const userAccounts = user?.accounts
  const dispatch = useDispatch();

  const [selectedAccount, setSelectedAccount] = useState(user?.accounts ? user?.accounts[0] : {});
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [requestedToken, setRequestedToken] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [openList, setOpenList] = useState(false)

  useEffect(() => {
    let timer;
    if (tokenExpiry && isOpen) {
      timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((tokenExpiry - now) / 1000));
        setTimeRemaining(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tokenExpiry, isOpen]);

  const handleRequestToken = async () => {
    if (!withdrawalAmount) {
      toast.error("Please enter a withdrawal amount.", {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await requestWithdrawalToken();
      if (response.success) {
        toast.success('Withdrawal token sent to your email', {
          style: {
            backgroundColor: 'rgba(229, 229, 229, 0.1)',
            color: '#fff',
            fontSize: '16px',
            marginTop: "60px"
          },
        });
        setRequestedToken(true);
        const expiryTime = Date.now() + 15 * 60 * 1000;
        setTokenExpiry(expiryTime);
        setTimeRemaining(15 * 60);
      } else {
        toast.error(response.message || 'Failed to request withdrawal token', {
          style: {
            backgroundColor: 'rgba(229, 229, 229, 0.1)',
            color: '#fff',
            fontSize: '16px',
            marginTop: "60px"
          },
        });
      }
    } catch (error) {
      toast.error('Failed to request withdrawal token', {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!withdrawalAmount || !selectedAccount.accountNumber || !withdrawalToken) {
      toast.error("Please enter an amount, select an account, and enter the withdrawal token.", {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      const withdrawalData = {
        amount: withdrawalAmount,
        accountNumber: selectedAccount.accountNumber,
        withdrawalToken
      }
      const response = await requestFiatWithdrawal(withdrawalData);

      if (response.success) {
        getUserProfile(dispatch)
        toast.success('Withdrawal request placed successfully', {
          style: {
            backgroundColor: 'rgba(229, 229, 229, 0.1)',
            color: '#fff',
            fontSize: '16px',
            marginTop: "60px"
          },
        });
        onClose();
      } else {
        toast.error(response.message || 'Withdrawal request failed', {
          style: {
            backgroundColor: 'rgba(229, 229, 229, 0.1)',
            color: '#fff',
            fontSize: '16px',
            marginTop: "60px"
          },
        });
      }
    } catch (error) {
      toast.error('Error processing withdrawal', {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenList = () => {
    setOpenList(!openList);
  };

  return (
    <div className={`fadded-container modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`modal-overlay  ${isOpen ? 'open' : ''}`} onClick={onClose}> </div>
      <div className="modal animate-slide-in animate-slide-in-mobile">
        <span className="close-modal" onClick={onClose}>X</span>
        <h2>Fiat Withdrawal</h2>
        {user?.accounts?.length === 0 ? 
        <>
          <h5>No account added yet</h5>
          <Link to="/accounts">Add Abank account now</Link>
        </> : 
        <>
          {!requestedToken ? (
            <>
              <div className="withdrawal-amount">
                <label htmlFor="amount">Withdrawal Amount:</label>
                <input
                className='withrawal-amount-input'
                  id="amount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min="0"
                  step="any"
                  required
                />
              </div>
              <div className="bank-accounts">
                <p>Select Account</p>

                <GeneralDropdown
                  items={userAccounts} 
                  selectedItem={setSelectedAccount} 
                  handleOpenList={handleOpenList} 
                  openList={openList}
                  item={selectedAccount}
                 />
      
                {selectedAccount.accountNumber && (
                  <div className="account-details">
                    <p><strong>Bank Name:</strong> {selectedAccount.bankName}</p>
                    <p><strong>Account Name:</strong> {selectedAccount.accountName}</p>
                    <p><strong>Account Number:</strong> {selectedAccount.accountNumber}</p>
                  </div>
                )}
              </div>
              <button 
                className="submit-btn" 
                onClick={handleRequestToken} 
                disabled={isLoading || !withdrawalAmount || timeRemaining > 0}
              >
                {isLoading ? 'Requesting Token...' : 'Request Withdrawal Token'}
              </button>
            </>
          ) : (
            <>
              <div className="withdrawal-token">
                <label htmlFor="token">Withdrawal Token:</label>
                <input
                  className='withrawal-amount-input'
                  id="token"
                  type="text"
                  value={withdrawalToken}
                  onChange={(e) => setWithdrawalToken(e.target.value)}
                  required
                />
              </div>
              <div className="token-info">
                {timeRemaining > 0 && (
                  <p>Token expires in {Math.floor(timeRemaining / 60)}:{timeRemaining % 60} minutes</p>
                )}
                {timeRemaining === 0 && (
                  <button 
                    className="resend-token-btn" 
                    onClick={handleRequestToken} 
                    disabled={isLoading || !withdrawalAmount}
                  >
                    {isLoading ? 'Requesting Token...' : 'Request New Token'}
                  </button>
                )}
              </div>
              <button 
                className="submit-btn" 
                onClick={handleSubmit} 
                disabled={isLoading || !withdrawalToken || !withdrawalAmount || !selectedAccount.accountNumber}
              >
                {isLoading ? 'Processing Withdrawal...' : 'Submit Withdrawal'}
              </button>
            </>
          )}
        </>
        }
      </div>
    </div>
  );
};

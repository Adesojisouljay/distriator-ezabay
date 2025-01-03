import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { confirmFiatDeposit, cancelFiatDeposit, getAllFiatDeposits, getMerchantById } from '../../api/ekzat';
import "./fiat-deposit-action.scss";
import FiatActionList from '../modal/FiatActionList';

export const FiatDepositAction = () => {
  const user = useSelector((state) => state.ekzaUser.user);
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [listModal, setListModal] = useState(false);
  const [listData, setListData] = useState(null);

  useEffect(() => {
    fetchDeposits();
    getMerchant();
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [searchTerm, deposits]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const response = await getAllFiatDeposits();
      setDeposits(response.data);
    } catch (error) {
      toast.error('Failed to fetch fiat deposits', {
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

  const getMerchant = async () => {
    try {
      const res = await getMerchantById();
      if (res.success) {
        setMerchantInfo(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmDeposit = async (depositId) => {
    try {
      await confirmFiatDeposit(depositId);
      toast.success('Deposit confirmed successfully', {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
      fetchDeposits();
      setListModal(false); // Close modal after confirming
    } catch (error) {
      toast.error('Failed to confirm deposit', {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
    }
  };

  const handleCancelDeposit = async (depositId) => {
    try {
      await cancelFiatDeposit(depositId);
      toast.success('Deposit canceled successfully', {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
      fetchDeposits();
      setListModal(false); // Close modal after canceling
    } catch (error) {
      toast.error('Failed to cancel deposit', {
        style: {
          backgroundColor: 'rgba(229, 229, 229, 0.1)',
          color: '#fff',
          fontSize: '16px',
          marginTop: "60px"
        },
      });
    }
  };

  const handleCloseModal = () => {
    setListModal(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterDeposits = () => {
    const filtered = deposits.filter((deposit) =>
      deposit.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeposits(filtered);
  };
  const getStatusEmoji = (status) => {
  switch (status) {
    case 'pending':
      return '🕒';
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    default:
      return '';
  }
};
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'completed':
      return 'status-completed';
    case 'failed':
      return 'status-failed';
    default:
      return '';
  }
};

  return (
    <div className="fiat-deposit-list">
      <h2>Fiat Deposits</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username or email"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {isLoading ? (
        <p>Loading deposits...</p>
      ) : (
        <>
          <div className="merchant-fund-info">
            <h2>Balance: {merchantInfo?.merchantBalance}</h2>
            <h2>Total Spent: {merchantInfo?.totalSpent}</h2>
            <h2>Last Topped: {merchantInfo?.lastTopped}</h2>
          </div>
          <table className="deposits-table">
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Amount</th>
                <th>Narration</th>
                <th>Status</th>
                <th>User Username</th>
                <th>User Email</th>
                <th>Merchant Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map((deposit, index) => (
                  <tr
                    key={deposit._id}
                    onClick={() => {
                      setListModal(true);
                      setListData(deposit);
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>{deposit.amount}</td>
                    <td>{deposit.narration}</td>
                    <td className={getStatusClass(deposit.status)}>
                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </td>
                    <td>{deposit.user.username}</td>
                    <td>{deposit.user.email}</td>
                    <td>{deposit?.merchantUsername?.username}</td>
                    <td>
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            className="confirm-btn"
                            onClick={() => handleConfirmDeposit(deposit._id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelDeposit(deposit._id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {deposit.status !== 'pending' && (
                        <span className="status-emoji">{getStatusEmoji(deposit.status)}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No deposits found</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
      {listModal && (
        <FiatActionList
          deposit={listData}
          isOpen={listModal}
          onClose={handleCloseModal}
          handleConfirmDeposit={handleConfirmDeposit}
          handleCancelDeposit={handleCancelDeposit}
        />
      )}
    </div>
  );
};

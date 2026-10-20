import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactionHistory } from '../api/transaction';
import { formatNumberWithCommas } from '../utils';
import TransactionList from '../components/modal/TransactionList';
import { FiSearch, FiArrowDownLeft, FiArrowUpRight, FiRepeat, FiCopy, FiCheck } from 'react-icons/fi';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import './transactions-page.scss';

export const TransactionsPage = () => {
  const [trxHistory, setTrxHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(null);

  const transactionsPerPage = 12;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactionHistory();
      if (data?.success) {
        setTrxHistory(data.transactionH || []);
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (e, txId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleRowClick = (tx) => {
    setSelectedTrx(tx);
    setModalOpen(true);
  };

  // Filter transactions
  const filteredTransactions = trxHistory
    .slice()
    .reverse()
    .filter((tx) => {
      const type = (tx.type || '').toLowerCase();
      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'deposit' && (type.includes('deposit') || type.includes('buy'))) ||
        (filterType === 'withdrawal' && (type.includes('withdrawal') || type.includes('sell'))) ||
        (filterType === 'transfer' && (type.includes('transfer') || type.includes('internal')));

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (tx.currency && tx.currency.toLowerCase().includes(q)) ||
        (tx.trxId && tx.trxId.toLowerCase().includes(q)) ||
        (tx.receiver && tx.receiver.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage) || 1;
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirst, indexOfLast);

  const getTypeMeta = (rawType = '') => {
    const type = rawType.toLowerCase();
    if (type.includes('deposit') || type.includes('buy')) {
      return {
        label: rawType || 'Deposit',
        icon: <FiArrowDownLeft size={16} />,
        className: 'type-deposit'
      };
    }
    if (type.includes('withdrawal') || type.includes('sell')) {
      return {
        label: rawType || 'Withdrawal',
        icon: <FiArrowUpRight size={16} />,
        className: 'type-withdrawal'
      };
    }
    return {
      label: rawType || 'Transfer',
      icon: <FiRepeat size={16} />,
      className: 'type-transfer'
    };
  };

  return (
    <div className="transactions-page-container">
      <div className="transactions-page-content">
        {/* Header Breadcrumb & Title */}
        <div className="transactions-header">
          <Link to="/dashboard" className="back-link">
            <HiOutlineArrowLeft size={18} />
            <span>Dashboard</span>
          </Link>
          <div className="header-text-block">
            <h1>Transaction History</h1>
            <p>Review and audit all your deposits, withdrawals, trades, and transfers</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="transactions-controls">
          <div className="filter-chips">
            <button 
              className={`chip ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => { setFilterType('all'); setCurrentPage(1); }}
            >
              All
            </button>
            <button 
              className={`chip ${filterType === 'deposit' ? 'active' : ''}`}
              onClick={() => { setFilterType('deposit'); setCurrentPage(1); }}
            >
              Deposits
            </button>
            <button 
              className={`chip ${filterType === 'withdrawal' ? 'active' : ''}`}
              onClick={() => { setFilterType('withdrawal'); setCurrentPage(1); }}
            >
              Withdrawals
            </button>
            <button 
              className={`chip ${filterType === 'transfer' ? 'active' : ''}`}
              onClick={() => { setFilterType('transfer'); setCurrentPage(1); }}
            >
              Transfers
            </button>
          </div>

          <div className="search-wrap">
            <FiSearch size={17} />
            <input 
              type="text"
              placeholder="Search by currency or TXID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Transactions Table Card */}
        <div className="transactions-card">
          <div className="table-responsive">
            <table className="exchange-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>TXID</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="table-status-cell">
                      <div className="loader-wrap">Loading transaction history...</div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-status-cell">
                      <div className="empty-state">
                        <p>No transactions found</p>
                        <span>Transactions will appear here once you make deposits or withdrawals.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((tx) => {
                    const typeMeta = getTypeMeta(tx.type);
                    const status = (tx.status || 'confirmed').toLowerCase();

                    return (
                      <tr key={tx._id || tx.trxId} onClick={() => handleRowClick(tx)} className="tx-row">
                        {/* Type */}
                        <td>
                          <span className={`type-badge ${typeMeta.className}`}>
                            {typeMeta.icon}
                            <span>{typeMeta.label}</span>
                          </span>
                        </td>

                        {/* Asset */}
                        <td>
                          <div className="asset-cell">
                            <span className="currency-pill">{tx.currency?.toUpperCase()}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className={`amount-cell ${typeMeta.className}`}>
                            {typeMeta.className === 'type-withdrawal' ? '-' : '+'}
                            {formatNumberWithCommas(tx.amount)}
                          </span>
                        </td>

                        {/* TXID */}
                        <td>
                          <div className="txid-cell" onClick={(e) => handleCopy(e, tx.trxId)}>
                            <span className="txid-text">
                              {tx.trxId ? `${tx.trxId.slice(0, 6)}...${tx.trxId.slice(-6)}` : 'N/A'}
                            </span>
                            {copiedTxId === tx.trxId ? (
                              <FiCheck size={14} className="copied-icon" />
                            ) : (
                              <FiCopy size={14} className="copy-icon" />
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td>
                          <span className="date-cell">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`status-pill ${status}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (shown on screens <= 768px) */}
          <div className="transactions-mobile-list">
            {loading ? (
              <div className="mobile-status-card">
                <div className="loader-wrap">Loading transaction history...</div>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="mobile-status-card">
                <div className="empty-state">
                  <p>No transactions found</p>
                  <span>Transactions will appear here once you make deposits or withdrawals.</span>
                </div>
              </div>
            ) : (
              currentItems.map((tx) => {
                const typeMeta = getTypeMeta(tx.type);
                const status = (tx.status || 'confirmed').toLowerCase();

                return (
                  <div
                    key={tx._id || tx.trxId}
                    className="tx-mobile-card"
                    onClick={() => handleRowClick(tx)}
                  >
                    <div className="tx-card-header">
                      <div className="type-and-asset">
                        <span className={`type-badge ${typeMeta.className}`}>
                          {typeMeta.icon}
                          <span>{typeMeta.label}</span>
                        </span>
                        <span className="currency-pill">{tx.currency?.toUpperCase()}</span>
                      </div>
                      <span className={`amount-cell ${typeMeta.className}`}>
                        {typeMeta.className === 'type-withdrawal' ? '-' : '+'}
                        {formatNumberWithCommas(tx.amount)}
                      </span>
                    </div>

                    <div className="tx-card-footer">
                      <span className="date-cell">
                        {tx.timestamp
                          ? new Date(tx.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </span>
                      <div className="status-and-txid">
                        {tx.trxId && (
                          <div
                            className="txid-cell"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(e, tx.trxId);
                            }}
                          >
                            <span className="txid-text">
                              {`${tx.trxId.slice(0, 4)}...${tx.trxId.slice(-4)}`}
                            </span>
                            {copiedTxId === tx.trxId ? (
                              <FiCheck size={12} className="copied-icon" />
                            ) : (
                              <FiCopy size={12} className="copy-icon" />
                            )}
                          </div>
                        )}
                        <span className={`status-pill ${status}`}>{status}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="table-pagination">
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredTransactions.length} total)
              </span>
              <div className="pagination-buttons">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn-page"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn-page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <TransactionList 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          trxListData={selectedTrx} 
        />
      )}
    </div>
  );
};

export default TransactionsPage;

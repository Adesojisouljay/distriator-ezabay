import React, { useEffect, useState } from 'react';
import { fetchTransactionHistory } from '../../api/transaction';
import { formatNumberWithCommas } from '../../utils';
import "./dbtransactionhistory.scss";

function DBTransactionHistory({ setTrxListOpen, setTrxListData }) {
  const [trxHistory, setTrxHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 15;

  // Fetch the transaction history when the component mounts
  useEffect(() => {
    getTrx();
  }, []);

  const getTrx = async () => {
    try {
      const data = await fetchTransactionHistory();
      if (data.success) {
        setTrxHistory(data.transactionH);
      } else {
        console.error("Failed to fetch transaction history:", data.message);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(trxHistory.length / transactionsPerPage);
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

  // Reverse trxHistory once, then paginate
  const currentTransactions = trxHistory.slice().reverse().slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getTypeClass = (type) => 
    type === "deposit" || type === "buy" 
      ? "transaction-history__deposit" 
      : type === "withdrawal" || type === "sell" 
      ? "transaction-history__withdrawal" 
      : "";

  return (
    <div className="db-transaction-history-container">
      <div className="transaction-history">
        <div className="transaction-history__header">
          <h3>Transaction History</h3>
        </div>

        <div className="transaction-history__table-wrap">
          <table>
            <thead>
              <tr>
                <th className='phone-none'>S/N</th>
                <th>Currency</th>
                <th>Amount</th>
                <th className='phone-none'>TxId</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="transaction-history__table-body">

              {currentTransactions.length === 0 && trxHistory.length === 0 && (
                <tr className="transaction-history__no-history">
                  <td colSpan="6">
                    <p>No History</p>
                  </td>
                </tr>
              )}

              {currentTransactions.map((t, index) => (
                <tr key={t.trxId} onClick={() => { setTrxListOpen(true); setTrxListData(t); }}>
                  <td className='phone-none'>{indexOfFirstTransaction + index + 1}</td>
                  <td className="transaction-history__currency-wrap">
                    <img src={"hive"} alt="" />
                    <span>{t.currency}</span>
                  </td>
                  <td className={getTypeClass(t.type)}>
                    {formatNumberWithCommas(t.amount)}
                  </td>
                  <td className='phone-none'>
                    {t.trxId.slice(0, 5)}...{t.trxId.slice(-5)}
                  </td>
                  <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td className={getTypeClass(t.type)}>
                    {t.type}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="transaction-history__pagination">
            <button
              className="transaction-history__page-btn"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`transaction-history__page-btn ${currentPage === index + 1 ? "active" : ""}`}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="transaction-history__page-btn"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DBTransactionHistory;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { HiMiniWallet } from "react-icons/hi2";
import { FaGift } from "react-icons/fa6";
import usdt from "../assets/usdt.svg";
import dai from "../assets/dai.svg";
import usdc from "../assets/usdc.svg";
import tusd from "../assets/tusd.svg";
import hive from "../assets/hive-logo.png";
import hbd from "../assets/hbdl.png";
import { FaRegCopyright } from "react-icons/fa";
import { DepositHiveModal } from "../components/modal/DepositHive";
import { fetchTransactionHistory } from "../api/transaction";
import "./dashboard.scss";
import { WithdrawalModal } from "../components/modal/WithdrawalModal";


export default function Dashtest() {
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [trxHistory, setTrxHistory] = useState([]);

  const user = useSelector(state => state.apexMiner.user)
  const assets = user?.assets || []

  const openDepositModal = (asset) => {
    setIsOpen(true);
  }
  
  const closeDepositModal = () => {
    setIsOpen(false)
  }
  
  const openWithdrawalModal = (asset) => {
    setWithdrawalOpen(true);
  }

  const closeWithdrawalModal = () => {
    setWithdrawalOpen(false)
  }

  useEffect(() => {
    getTrx()
  }, [trxHistory])
  
  const getTrx = async () => {
    try {
      const data = await fetchTransactionHistory();
      if (data.success) {
        setTrxHistory(data.transactionH);
        console.log("data,", data);
        console.log("trxHistory,", trxHistory);
      } else {
        console.error("Failed to fetch transaction history:", data.message);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrap">
      <div className=" total-balance-wrap">
        <div className="total-left border-transparent">
          <div className="kingsley-to decide-and-style">
            <div className="currency">
              <span>Currency</span>
              <select name="" id="">
                <option value="Ngn">NGN</option>
                <option value="Ngn">USD</option>
              </select>
            </div>
            <div className="total-left-wrap">
              <h3>Total balance:</h3>
              <h2><span className="strike-naira">N</span>{user?.totalNairaValue?.toFixed(3)}</h2>
            </div>
          </div>
          <FaRegEye />
        </div>
        <div className="total-right border-transparent">
          <h4>Bronze Merbership</h4>
          <FaRegCircleQuestion />
          <FaRegEye />
        </div>
      </div>
      <div className="big-card-wrap">
        <div className="funding-wrap">
          <button onClick={() => openDepositModal(assets[0])}>Receive</button>
          <button onClick={openWithdrawalModal}>Send</button>
          <button>Fiat Transfer</button>
          <button>Fiat Deposit</button>
          <button>Buy</button>
          <button>Sell</button>
        </div>
      </div>
      <div className="portfolio-reward-wraper">
        <div className="card-wrap border-transparent">
          <div className="card-title-wrap">
            <div className="card-icon">
              <HiMiniWallet size={20} />
            </div>
            <h4>Portfolio</h4>
          </div>

          <div className="card-bal">
            <h2>$0.00</h2>
          </div>

          <div className="card-component-wrap">
            <div className="card-component-1">
              <div className="card-list-wrap liquid-asset-wrap">
                <h5>Liqud asset</h5>
                <p>$0.00</p>
              </div>
              <div className="card-list-wrap staked-assets-wrap">
                <h5>Staked Assets</h5>
                <p>$0.00</p>
              </div>
              <div className="card-list-wrap liquidity-positions-wrap">
                <h5>Staked Assets</h5>
                <p>$0.00</p>
              </div>
            </div>
            <div className="card-component-2">
              <div className="card-list-wrap Leverage-wrap">
                <h5>Leverage LP</h5>
                <p>$0.00</p>
              </div>
              <div className="card-list-wrap perpetual-positions-wrap">
                <h5>Perpetual Positions</h5>
                <p>$0.00</p>
              </div>
              <div className="card-list-wrap Borrows-wrap">
                <h5>Borrows</h5>
                <p>$0.00</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card-wrap border-transparent">
          <div className="card-title-wrap">
            <div className="card-icon">
              <FaGift size={20} />
            </div>
            <h4>Assets</h4>
          </div>

          <div className="card-bal">
            <h2>${user?.totalUsdValue?.toFixed(3)}</h2>
            <h2><span className="strike-naira">N</span>{user?.totalNairaValue?.toFixed(3)}</h2>
          </div>

              
          <div className="card-component-wrap">
            {user?.assets?.map(u => (
              <div className="card-component-1 border-line">
                <div className="card-reward-wrap liquid-asset-wrap">
                  <img src={u.image} alt="" />
                  <div className="reward-value">
                    <h5>{u.currency.toUpperCase()}</h5>
                    <p>{u.balance?.toFixed(3)}</p>
                  </div>
                </div>
                <div className="btn-deposit-withdrwal">
                <button onClick={() => openDepositModal(u)}>Deposit</button>
                <button>Withdraw</button>
                <button>Buy/Sell</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="big-card-wrap">
        <div className="histroy-wrap">
          <h3>Transaction History</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Amout</th>
                  <th>TxId</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
              {trxHistory?.length === 0 && (
              <tr className="no-history">
                <td colSpan="5">
                  <p>No History</p>
                </td>
              </tr>
            )}
                {trxHistory?.map(t => (
                  <tr key={t.trxId}>
                    <td className="currency-wrap">
                      <img src={hive} alt="" />
                      <span>{t.currency}</span>
                    </td>
                    <td className={t.type  === 'deposit' ? 'deposit' : t.type === 'withdrawal' ? 'withdrawal' : ''}>${t.amount}</td>
                    <td>{t.trxId.slice(0, 5)}...{t.trxId.slice(-5)}</td>
                    <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                    <td className={t.type  === 'deposit' ? 'deposit' : t.type === 'withdrawal' ? 'withdrawal' : ''}>{t.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="copy-right-wrap">
       <FaRegCopyright />
       <p>Sojminer,All Rights Reserved </p>
      </div>
      </div>
      <DepositHiveModal isOpen={isOpen} assets={assets} onClose={closeDepositModal}/>
      <WithdrawalModal isOpen={withdrawalOpen} assets={assets} onClose={closeWithdrawalModal}/>
    </div>
  );
}

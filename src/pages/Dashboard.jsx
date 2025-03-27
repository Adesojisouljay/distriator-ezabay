import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaGift, FaRegEye } from "react-icons/fa";
import { FaRegCopyright } from "react-icons/fa";
import { DepositHiveModal } from "../components/modal/DepositHive";
import "./dashboard.scss";
import { WithdrawalModal } from "../components/modal/WithdrawalModal";
import Fiatdeposit from "../components/modal/Fiatdeposit";
import { FiatTransferModal } from "../components/modal/FiatTransfer";
import { BuySellModal } from "../components/modal/BuyAndSell";
import { FiatWithdrawalModal } from "../components/modal/FiatWithdrawal";
import { setCurrency } from "../redux/currencySlice";
import { usdPrice, formatNumberWithCommas } from "../utils";
import { ListedTokens } from "../components/listed-tokens/ListedTokens";
import { HiCircleStack, HiArrowUpCircle, HiArrowDownCircle, HiMiniShoppingCart, HiFolderPlus, HiFolderMinus } from "react-icons/hi2"
import { TransactionHistory } from "../components/transaction-history/TransactionHistory";
import { FiSearch } from "react-icons/fi";
import DBTransctionHistory from "../components/transaction-history/DBTransctionHistory";
import { BuySell } from "../components/modal/BuySell";
import { currenciesList } from "../vairables/protectedRoutes";
import { GeneralDropdown } from "../components/dropdown/GeneralDrpdpown";
import TransactionList from "../components/modal/TransactionList";

export const Dashboard = () => {
  const user = useSelector((state) => state.ekzaUser?.user);
  const selectedCurrency = useSelector((state) => state.currency.selectedCurrency);
  const selectedCurrenc = useSelector((state) => state);
  const dispatch = useDispatch();
  const assets = user?.assets || [];
  // const isUsd = selectedCurrency === "USD";

  const [isOpen, setIsOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [trxListOpen, setTrxListOpen] = useState(false)
  const [action, setAction] = useState(false);
  const [fiatDepositOpen, setFiatDepositOpen] = useState(false);
  const [fiatWithdrawalOpen, setFiatWithdrawalOpen] = useState(false);
  const [fiatTransferOpen, setFiatTransferOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('buy');
  const [showBalance, setShowBalance] = useState(false);
  const [activeTab, setActiveTab] = useState('coin-price');
  const [searchQueryCoinPrice, setSearchQueryCoinPrice] = useState('');
  const [showMore, setShowMore] = useState(false)
  const [buySellOpen, setBuySellOpen] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false)
  const [toggle, setToggle] = useState(true)
  const [trxListData, setTrxListData] = useState(null)

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
};
  
 const handleShowMore = () =>{
  setShowMore(!showMore)
 }

  const actionToggle = () => {
    setAction(!action);
  };

  const actionToggleClose = () => {
    if (action === true) {
      setAction(false);
    }
  };

  const toggleBalanceView = () => {
    setShowBalance(!showBalance);
  };

  const handleOpenAsset = () => {
    setAssetOpen(!assetOpen);
  };

  const openFiatDepositModal = () => {
    setFiatDepositOpen(true);
  };

  const openFiatTransferModal = () => {
    setFiatTransferOpen(true);
  };

  const closeFiatTransferModal = () => {
    setFiatTransferOpen(false);
  };

  const closeFiatDepositModal = () => {
    setFiatDepositOpen(false);
  };

  const openDepositModal = (asset) => {
    setIsOpen(true);
  };

  const closeDepositModal = () => {
    setIsOpen(false);
  };

  const openWithdrawalModal = (asset) => {
    setWithdrawalOpen(true);
  };

  const closeWithdrawalModal = () => {
    setWithdrawalOpen(false);
  };

  const openFiatWithdrawalModal = () => {
    setFiatWithdrawalOpen(true);
  };

  const closeFiatWithdrawalModal = () => {
    setFiatWithdrawalOpen(false);
  };

  const openBuySellModal = (type) => {
    setTransactionType(type);
    setBuySellOpen(true);
  };
  const closeBuySellModal = () => {
    setBuySellOpen(false);
  };
  const closeTrxListModal = () => {
    setTrxListOpen(false);
  };


  const handleCurrencyChange = (currency) => {
    const selectedC = currenciesList.find(c => c.name === currency);
    dispatch(setCurrency(currency));
  };

  const handleOpenList = () => {
    setOpenList(!openList);
  };

  return (
    <div className="dashboard-container" onClick={actionToggleClose}>
      <div className="dashboard-content">
      <div className="greetings-container">
      </div>
        <div className={`dashboard-content-wrap `}>
          <div className={`dashboard-main border-transparent   ${toggle ? "display-block" : ""}`}>
            <div className="wrap-float-right">
          <div className="left-tabs-wrap margin-out">
                <div
                    className={`dashboard ${toggle ? 'activetab-1' : ''}`}
                    onClick={()=> setToggle(true)}
                >
                    Dashboard
                </div>
                <div
                    className={`asset ${!toggle  ? 'activetab-1' : ''}`}
                    onClick={()=> setToggle(false)}
                >
                    Wallet
                </div>

            </div>
            </div>
            <div className="bal-top-wrap">
              <div className="total-fait-wrap">
               <div className="bal-text-select-wrap">
                <GeneralDropdown
                  items={currenciesList}
                  setSelectedItem={handleCurrencyChange} 
                  handleOpenList={handleOpenList} 
                  openList={openList}
                  itemName={selectedCurrency}
                  selectLabal="currency"
                />

               </div>
               <div className="bal-show-wrap">
                {showBalance ? ( <h3>********</h3> ) : (
                  <span>
                  <span className="dashboard-currency-symbol">{selectedCurrency?.sign}</span>
                  {/* Should be properly handles when we finailise other country currency */}
                  {selectedCurrency?.country === "Usa" ? formatNumberWithCommas(user?.nairaBalance / usdPrice)
                    : formatNumberWithCommas(user?.nairaBalance)}
                 </span>)}
                </div>
              </div>
              <div className="bal-action-wrap">
               <FaRegEye className="show-balance" onClick={toggleBalanceView} />
              </div>
            </div>
            <div className="bal-btn-wrap-main"> 

            <div className="bal-btn-wrap">
            <span className="bal-btn" onClick={openWithdrawalModal}>
                <div className="bal-icon-wrap">
                <HiArrowUpCircle size={30} />
                </div>
                <span>Send</span>
              </span>
              <span className="bal-btn" onClick={() => openDepositModal(assets[0])}>
                <div className="bal-icon-wrap">
                <HiArrowDownCircle size={30} />
                </div>
                <span>Receive</span>
              </span>
              
    
              <span className="bal-btn" onClick={()=> openBuySellModal("buy")}>
                <div className="bal-icon-wrap">
                <HiMiniShoppingCart size={27}/>
                </div>
                <span>Buy/Sell</span>
              </span>
              <span className="bal-btn" onClick={openFiatDepositModal}>
                <div className="bal-icon-wrap">
                <HiFolderPlus size={27} />
                </div>
                <span>Deposit</span>
              </span>

              <span className="bal-btn" onClick={openFiatWithdrawalModal}>
                <div className="bal-icon-wrap">
                <HiFolderMinus size={27} />
                </div>
                <span>Withdraw</span>
              </span>

              <span className="bal-btn" onClick={openFiatTransferModal}>
                <div className="bal-icon-wrap">
                <HiFolderMinus size={27} />
                </div>
                <span>Fiat transfer</span>
              </span>

            </div>
            </div>

          </div>

           <div className={`portfolio-reward-wraper ${!toggle ? "display-block" : ""} `}>
            <div className="card-wrap border-transparent">
            
              <div className="wrap-asset-header">
              <div className="card-title-wrap">
                <div className="card-icon">
                  <FaGift size={20} />
                </div>
                <h4>Wallet</h4>
              </div>
               <div className="tab-wrap">
              <div className="left-tabs-wrap tab-width">
              <div
                    className={`dashboard ${toggle ? 'activetab-1' : ''}`}
                    onClick={()=> setToggle(true)}
                >
                    Dashboard
                </div>
                <div
                    className={`asset ${!toggle  ? 'activetab-1' : ''}`}
                    onClick={()=> setToggle(false)}
                >
                    Wallet
                </div>

              </div>
              </div>
              </div>
              <p style={{ marginBottom: 10 }}>
                Balance:{" "}
                {selectedCurrency?.country === "Usa"
                  ? `$${formatNumberWithCommas(user?.totalUsdValue)}`
                  : `₦${formatNumberWithCommas(user?.totalNairaValue)}`}
              </p>

              <div className="card-component-wrap">
                {assets?.slice(0, 4).map((a) => (
                  <div className="card-component-1 border-line" key={a.coinId}>
                    <div className="coin-wrap">
                      <img src={a.image} alt="" />
                      <div>
                        <h5>{a.symbol}</h5>
                      </div>
                    </div>
                    <div>
                      <span className="asset-b">{a.balance.toFixed(3)}</span>
                    </div>
                    <span className="asset-v">
                      {selectedCurrency?.country === "Usa"
                        ? `$${formatNumberWithCommas(a.balance * a.usdValue)}`
                        : `₦${formatNumberWithCommas(a.balance * a.nairaValue)}`
                        }
                    </span>
                    <div>
                      <span className={`asset-percent ${a.percentageChange < 0 ? "red" : "green"}`}
                        style={{
                          color: a.percentageChange < 0 ? "red" : "green",
                        }}
                      >
                        {a.percentageChange}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    <div className="bal-big-container-wrap">
        <div className="tabs-wrap">
            <div className="left-tabs-wrap">
                <div
                    className={`coin-price ${activeTab === 'coin-price' ? 'activetab' : ''}`}
                    onClick={() => handleTabClick('coin-price')}
                >
                    Coin Price
                </div>
                <div
                    className={`transaction ${activeTab === 'transaction' ? 'activetab' : ''}`}
                    onClick={() => handleTabClick('transaction')}
                >
                    Transaction
                </div>
            </div>

            <div className="right-tabs-wrap">
                <input className={`search-bal-input ${activeTab === 'transaction' ? 'activetab' : ''}`} type="text" placeholder="Search..." />
                <input className={`search-coin-price ${activeTab === 'coin-price' ? 'activetab' : ''}`} type="text" placeholder="Search coin "  value={searchQueryCoinPrice}
                    onChange={(e) => setSearchQueryCoinPrice(e.target.value)}/>
                <FiSearch size={19} />
            </div>
        </div>

        <div className="display-area">
            <div className={`coin-price-component ${activeTab === 'coin-price' ? 'activetab' : ''}`}>
                <ListedTokens setSearchQuery={setSearchQueryCoinPrice} searchQuery={searchQueryCoinPrice} openBuySellModal={openBuySellModal}  />
            </div>
            <div className={`transction-component ${activeTab === 'transaction' ? 'activetab' : ''}`}>
                <DBTransctionHistory  setTrxListOpen={setTrxListOpen} setTrxListData={setTrxListData}  />
            </div>
            <div className={`stake-component ${activeTab === 'stake' ? 'activetab' : ''}`}>
              <h1>Staking is coming soon</h1>
            </div>
        </div>
    </div>
        <div className="dashboard-footer">
          <FaRegCopyright />
          <p>Ezabay, All Rights Reserved</p>
        </div>
        
      </div>
      {isOpen && <DepositHiveModal
        isOpen={isOpen}
        assets={assets}
        onClose={closeDepositModal}
        user={user}
      />}

      {buySellOpen && (
        <BuySellModal
          isOpen={buySellOpen}
          onClose={closeBuySellModal}
          assets={assets}
          transactionType={transactionType}
          setTransactionType={setTransactionType}
        />
      )}
      {buySellOpen && (
        <BuySell
          isOpen={buySellOpen}
          onClose={closeBuySellModal}
          assets={assets}
          transactionType={transactionType}
          setTransactionType={setTransactionType}
        />
      )}
      {withdrawalOpen && 
      <WithdrawalModal 
        isOpen={withdrawalOpen} 
        assets={assets} 
        onClose={closeWithdrawalModal}
        user={user}
      />}
      {fiatTransferOpen && <FiatTransferModal isOpen={fiatTransferOpen} onClose={closeFiatTransferModal} />}
      {fiatDepositOpen && <Fiatdeposit onClose={closeFiatDepositModal} isOpen={fiatDepositOpen} />}
      {fiatWithdrawalOpen && <FiatWithdrawalModal onClose={closeFiatWithdrawalModal} isOpen={fiatWithdrawalOpen} assets={assets} />}
      {trxListOpen && <TransactionList isOpen={trxListOpen} onClose={closeTrxListModal} trxListData={trxListData} />}
    </div>
  );
}

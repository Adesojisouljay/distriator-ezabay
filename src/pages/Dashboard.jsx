import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaRegEye, FaRegEyeSlash, FaWallet, FaRegCopyright } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { CgMoreO } from "react-icons/cg";
import { DepositHiveModal } from "../components/modal/DepositHive";
import "./dashboard.scss";
import { WithdrawalModal } from "../components/modal/WithdrawalModal";
import Fiatdeposit from "../components/modal/Fiatdeposit";
import { FiatTransferModal } from "../components/modal/FiatTransfer";
import { SendOptions } from "../components/modal/sendOptions";
import { FiatWithdrawalModal } from "../components/modal/FiatWithdrawal";
import { setCurrency } from "../redux/currencySlice";
import { usdPrice, formatNumberWithCommas } from "../utils";
import { ListedTokens } from "../components/listed-tokens/ListedTokens";
import { 
  HiCircleStack, 
  HiArrowUpCircle, 
  HiArrowDownCircle, 
  HiMiniShoppingCart, 
  HiFolderPlus, 
  HiFolderMinus, 
  HiBolt,
  HiArrowPath,
  HiArrowTrendingUp,
  HiWallet
} from "react-icons/hi2";
import { getUserProfile } from "../api/profile";
import DBTransctionHistory from "../components/transaction-history/DBTransctionHistory";
import { BuySell } from "../components/modal/BuySell";
import { currenciesList } from "../vairables/protectedRoutes";
import { GeneralDropdown } from "../components/dropdown/GeneralDrpdpown";
import TransactionList from "../components/modal/TransactionList";
import { InternalTransferModal } from "../components/modal/InternalTransferModal";
import { ComingSoon } from "../components/modal/CommingSoon";

export const Dashboard = () => {
  const user = useSelector((state) => state.ekzaUser?.user);
  const selectedCurrency = useSelector((state) => state.currency.selectedCurrency);
  const selectedCurrenc = useSelector((state) => state);
  const dispatch = useDispatch();
  const assets = user?.assets || [];
  // const isUsd = selectedCurrency === "USD";

  const [isOpen, setIsOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [internalWithdrawalOpen, setInternalWithdrawalOpen] = useState(false);
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
  const [sendOptionsOpen, setSendOptionsOpen] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false)
  const [trxListData, setTrxListData] = useState(null);
  const [comingSoon, setComingSoonOpen] = useState(false);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleShowMore = () => {
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
  const closeComingSoonModal = () => {
    setComingSoonOpen(false);
  };

  const openComingSoonModal = (asset) => {
    setComingSoonOpen(true);
  };

  const closeDepositModal = () => {
    setIsOpen(false);
  };

  const openWithdrawalModal = (asset) => {
    setWithdrawalOpen(true);
  };

  const openInternalWithdrawalModal = (asset) => {
    setInternalWithdrawalOpen(true);
  };

  const closeWithdrawalModal = () => {
    setWithdrawalOpen(false);
  };

  const closeInternalWithdrawalModal = (asset) => {
    setInternalWithdrawalOpen(false);
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

  const closeSendOptionModal = () => {
    setSendOptionsOpen(false);
  };

  const openSendOptionModal = () => {
    setSendOptionsOpen(true);
  };


  const [isRefreshing, setIsRefreshing] = useState(false);

  const isUsd = selectedCurrency?.name === "USD" || selectedCurrency?.country === "Usa" || selectedCurrency === "USD";
  const currencySign = selectedCurrency?.sign || (isUsd ? "$" : "₦");

  const fiatNaira = Number(user?.nairaBalance || 0);

  const cryptoNaira = useMemo(() => {
    if (user?.totalNairaValue && Number(user.totalNairaValue) > 0) {
      return Number(user.totalNairaValue);
    }
    return assets.reduce((sum, a) => {
      const worth = Number(a.assetNairaWorth);
      if (!isNaN(worth) && worth > 0) return sum + worth;
      const bal = Number(a.balance || 0);
      const val = Number(a.nairaValue || 0);
      return sum + (bal * val);
    }, 0);
  }, [user?.totalNairaValue, assets]);

  const rate = usdPrice && Number(usdPrice) > 0 ? Number(usdPrice) : 1420;

  const cryptoUsd = useMemo(() => {
    if (user?.totalUsdValue && Number(user.totalUsdValue) > 0) {
      return Number(user.totalUsdValue);
    }
    return cryptoNaira / rate;
  }, [user?.totalUsdValue, cryptoNaira, rate]);

  const fiatUsd = fiatNaira / rate;

  const currentTotal = isUsd ? (fiatUsd + cryptoUsd) : (fiatNaira + cryptoNaira);
  const currentFiat = isUsd ? fiatUsd : fiatNaira;
  const currentCrypto = isUsd ? cryptoUsd : cryptoNaira;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await getUserProfile(dispatch);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 700);
    }
  };

  const handleCurrencyChange = (currency) => {
    const selectedC = currenciesList.find((c) => c.name === currency) || {
      name: currency,
      sign: currency === "USD" ? "$" : "₦",
      country: currency === "USD" ? "Usa" : "Nigeria",
    };
    dispatch(setCurrency(selectedC));
  };

  const handleOpenList = () => {
    setOpenList(!openList);
  };

  return (
    <div className="dashboard-container" onClick={actionToggleClose}>
      <div className="dashboard-content">
        <div className="greetings-container">
        </div>
        <div className="dashboard-content-wrap">
          {/* Left Card: Main Balance Hero Card (Matching Screenshot 1) */}
          <div className="dashboard-main border-transparent">
            {/* Header: Title + Eye & Controls (Segmented Pill + Refresh) */}
            <div className="balance-card-header">
              <div className="balance-title-wrap">
                <span className="balance-label">
                  {isUsd ? "Total USD Balance" : "Total Naira Balance"}
                </span>
                <button
                  type="button"
                  className="balance-eye-btn-inline"
                  onClick={toggleBalanceView}
                  title={showBalance ? "Show Balance" : "Hide Balance"}
                >
                  {showBalance ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
                </button>
              </div>

              <div className="balance-header-controls">
                <div className="currency-segmented-pill">
                  <button
                    type="button"
                    className={`curr-pill-btn ${!isUsd ? "active" : ""}`}
                    onClick={() => handleCurrencyChange("NGN")}
                  >
                    NGN
                  </button>
                  <button
                    type="button"
                    className={`curr-pill-btn ${isUsd ? "active" : ""}`}
                    onClick={() => handleCurrencyChange("USD")}
                  >
                    USD
                  </button>
                </div>

                <button
                  type="button"
                  className={`balance-refresh-btn ${isRefreshing ? "spinning" : ""}`}
                  onClick={handleRefresh}
                  title="Refresh Balance"
                >
                  <HiArrowPath size={16} />
                </button>
              </div>
            </div>

            {/* Main Balance Display */}
            <div className="balance-main-amount">
              {showBalance ? (
                <span className="masked-balance">••••••••</span>
              ) : (
                <span className="amount-text">
                  <span className="symbol">{currencySign}</span>
                  {formatNumberWithCommas(currentTotal.toFixed(2))}
                </span>
              )}
            </div>

            {/* Performance / Daily Trend */}
            <div className="balance-trend-wrap">
              <span className="trend-badge positive">
                <HiArrowTrendingUp size={15} />
                <span>+0.99% today</span>
              </span>
            </div>

            {/* Sub-cards Row: Fiat Balance & Crypto Assets */}
            <div className="balance-subcards-row">
              {/* Fiat Balance Sub-Card */}
              <div className="balance-subcard">
                <div className="subcard-header">
                  <HiWallet className="subcard-icon" size={17} />
                  <span className="subcard-title">Fiat Balance</span>
                </div>
                <div className="subcard-value">
                  {showBalance ? (
                    <span>••••••••</span>
                  ) : (
                    <span>
                      {currencySign}
                      {formatNumberWithCommas(currentFiat.toFixed(2))}
                    </span>
                  )}
                </div>
                <span className="subcard-subtext">
                  {isUsd ? "US Dollar (USD)" : "Naira (NGN)"}
                </span>
              </div>

              {/* Crypto Assets Sub-Card */}
              <div className="balance-subcard">
                <div className="subcard-header">
                  <HiCircleStack className="subcard-icon" size={17} />
                  <span className="subcard-title">Crypto Assets</span>
                </div>
                <div className="subcard-value">
                  {showBalance ? (
                    <span>••••••••</span>
                  ) : (
                    <span>
                      {currencySign}
                      {formatNumberWithCommas(currentCrypto.toFixed(2))}
                    </span>
                  )}
                </div>
                <span className="subcard-subtext">Across all networks</span>
              </div>
            </div>
          </div>

          {/* Right Card: Action Buttons Card (Replaces the wallet card) */}
          <div className="dashboard-actions-card">
            <div className="actions-header-wrap">
              <div className="actions-title-wrap">
                <div className="card-icon">
                  <HiBolt size={18} />
                </div>
                <h4>Quick Actions</h4>
              </div>
              <span className="actions-subtext">Services</span>
            </div>

            <div className="bal-btn-wrap">
              <span className="bal-btn" onClick={openSendOptionModal}>
                <div className="bal-icon-wrap">
                  <HiArrowUpCircle size={26} />
                </div>
                <span>Send</span>
              </span>

              <span className="bal-btn" onClick={() => openDepositModal(assets[0])}>
                <div className="bal-icon-wrap">
                  <HiArrowDownCircle size={26} />
                </div>
                <span>Receive</span>
              </span>

              <span className="bal-btn" onClick={() => openBuySellModal("buy")}>
                <div className="bal-icon-wrap">
                  <HiMiniShoppingCart size={24} />
                </div>
                <span>Buy/Sell</span>
              </span>

              <span className="bal-btn" onClick={openFiatDepositModal}>
                <div className="bal-icon-wrap">
                  <HiFolderPlus size={24} />
                </div>
                <span>Deposit</span>
              </span>

              <span className="bal-btn" onClick={openFiatWithdrawalModal}>
                <div className="bal-icon-wrap">
                  <HiFolderMinus size={24} />
                </div>
                <span>Withdraw</span>
              </span>

              <span className="bal-btn" onClick={openFiatTransferModal}>
                <div className="bal-icon-wrap">
                  <HiFolderMinus size={24} />
                </div>
                <span>Fiat Transfer</span>
              </span>

              <Link to="/wallet" className="bal-btn wallet-btn-link">
                <div className="bal-icon-wrap">
                  <FaWallet size={21} />
                </div>
                <span>Wallet</span>
              </Link>

              <span className="bal-btn" onClick={openComingSoonModal}>
                <div className="bal-icon-wrap">
                  <CgMoreO size={24} />
                </div>
                <span>More...</span>
              </span>
            </div>
          </div>
        </div>
        <div className="bal-big-container-wrap">
          <div className="tabs-wrap">
            <div className="markets-title-block">
              <h3>Live Markets</h3>
              <Link to="/transactions" className="view-transactions-link">
                View Transaction History &rarr;
              </Link>
            </div>

            <div className="right-tabs-wrap">
              <input 
                className="search-coin-price" 
                type="text" 
                placeholder="Search coin..." 
                value={searchQueryCoinPrice}
                onChange={(e) => setSearchQueryCoinPrice(e.target.value)} 
              />
              <FiSearch size={19} />
            </div>
          </div>

          <div className="display-area">
            <ListedTokens setSearchQuery={setSearchQueryCoinPrice} searchQuery={searchQueryCoinPrice} openBuySellModal={openBuySellModal} />
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

      {internalWithdrawalOpen &&
        <InternalTransferModal
          isOpen={internalWithdrawalOpen}
          assets={assets}
          onClose={closeInternalWithdrawalModal}
          user={user}
        />}

      {fiatTransferOpen && <FiatTransferModal isOpen={fiatTransferOpen} onClose={closeFiatTransferModal} />}

      {fiatDepositOpen && <Fiatdeposit onClose={closeFiatDepositModal} isOpen={fiatDepositOpen} />}

      {comingSoon && <ComingSoon onClose={closeComingSoonModal} isOpen={comingSoon} />}

      {fiatWithdrawalOpen && <FiatWithdrawalModal onClose={closeFiatWithdrawalModal} isOpen={fiatWithdrawalOpen} assets={assets} />}

      {trxListOpen && <TransactionList isOpen={trxListOpen} onClose={closeTrxListModal} trxListData={trxListData} />}

      {sendOptionsOpen &&
        <SendOptions
          isOpen={sendOptionsOpen}
          onClose={closeSendOptionModal}
          internalOpen={openInternalWithdrawalModal}
          // inrernalClose={closeInternalWithdrawalModal}
          openOnchain={openWithdrawalModal}
        />}
    </div>
  );
}

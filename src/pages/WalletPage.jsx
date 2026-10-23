import React, { useEffect, useState, useMemo } from 'react';
import { fetchCryptoData, addAsset, removeAsset } from '../api/ekzat';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import './wallet-page.scss';
import { 
  FaWallet, 
  FaRegEye, 
  FaRegEyeSlash,
  FaRegCopy 
} from 'react-icons/fa';
import { 
  HiArrowUpCircle, 
  HiArrowDownCircle, 
  HiMiniShoppingCart, 
  HiPlus, 
  HiCheck, 
  HiTrash, 
  HiArrowLeft, 
  HiMagnifyingGlass,
  HiClock
} from 'react-icons/hi2';
import { getUserProfile } from '../api/profile';
import { toast } from 'react-toastify';
import { Loader } from '../components/loader/Loader';
import { formatNumberWithCommas } from '../utils';

// Modals
import { DepositHiveModal } from '../components/modal/DepositHive';
import { WithdrawalModal } from '../components/modal/WithdrawalModal';
import { InternalTransferModal } from '../components/modal/InternalTransferModal';
import { BuySell } from '../components/modal/BuySell';
import { SendOptions } from '../components/modal/sendOptions';

// Whitelist of coins finalized for production deployment
// Only Bitcoin is enabled for external HD wallet generation; all other coins remain Coming Soon
const FINALIZED_PRODUCTION_COINS = ['hive', 'hive_dollar', 'hbd', 'bitcoin', 'btc'];

export const WalletPage = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHoldings, setSearchHoldings] = useState('');
  const [searchMarket, setSearchMarket] = useState('');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [internalWithdrawalOpen, setInternalWithdrawalOpen] = useState(false);
  const [buySellOpen, setBuySellOpen] = useState(false);
  const [sendOptionsOpen, setSendOptionsOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('buy');
  const [selectedAssetForModal, setSelectedAssetForModal] = useState(null);

  const user = useSelector((state) => state.ekzaUser?.user);
  const selectedCurrency = useSelector((state) => state.currency?.selectedCurrency);
  const dispatch = useDispatch();

  const isUsd = selectedCurrency?.country === 'Usa' || selectedCurrency?.name === 'USD';
  const currencySign = selectedCurrency?.sign || (isUsd ? '$' : '₦');
  const assets = user?.assets || [];

  useEffect(() => {
    getCryptoData();
  }, [isUsd]);

  const getCryptoData = async () => {
    try {
      setLoading(true);
      const response = await fetchCryptoData();
      if (response?.data?.success) {
        const { usdData, ngnData } = response.data.cryptoData;
        const list = isUsd ? usdData : ngnData;
        setCryptoData(list || []);
      } else {
        setError(response?.data?.message || 'Failed to fetch market data.');
      }
    } catch (err) {
      setError('An error occurred while fetching token prices.');
    } finally {
      setLoading(false);
    }
  };

  const addTokenToWallet = async (coinId) => {
    setActionLoading(true);
    try {
      const response = await addAsset(coinId);
      if (response?.success) {
        toast.success(response.message || 'Asset added to wallet!');
        await getUserProfile(dispatch);
      } else {
        toast.error(response?.message || 'Failed to add asset.');
      }
    } catch (err) {
      toast.error(err?.message || 'Error adding asset to wallet.');
    } finally {
      setActionLoading(false);
    }
  };

  const hideTokenFromWallet = async (coinId, symbol) => {
    if (!window.confirm(`Hide ${symbol?.toUpperCase() || 'this asset'} from your wallet view?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await removeAsset(coinId);
      toast.success(`${symbol?.toUpperCase() || 'Asset'} hidden from wallet`);
      await getUserProfile(dispatch);
    } catch (err) {
      toast.error(err?.message || 'Error hiding asset');
    } finally {
      setActionLoading(false);
    }
  };

  const isAssetAdded = (coinId) => {
    return assets.some((a) => a.coinId === coinId);
  };

  // Filter user assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.symbol?.toLowerCase().includes(searchHoldings.toLowerCase()) ||
        asset.currency?.toLowerCase().includes(searchHoldings.toLowerCase());
      const hasBalance = !hideZeroBalances || (asset.balance && asset.balance > 0);
      return matchesSearch && hasBalance;
    });
  }, [assets, searchHoldings, hideZeroBalances]);

  // Filter market tokens
  const filteredMarketTokens = useMemo(() => {
    if (!searchMarket.trim()) return cryptoData.slice(0, 50);
    const q = searchMarket.toLowerCase();
    return cryptoData.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q)
    );
  }, [cryptoData, searchMarket]);

  // Modal handlers
  const handleOpenDeposit = (asset) => {
    setSelectedAssetForModal(asset || assets[0]);
    setIsOpen(true);
  };
  const handleCloseDeposit = () => setIsOpen(false);

  const handleOpenSend = (asset) => {
    setSelectedAssetForModal(asset || assets[0]);
    setSendOptionsOpen(true);
  };
  const handleCloseSend = () => setSendOptionsOpen(false);

  const handleOpenWithdrawal = (asset) => {
    setSelectedAssetForModal(asset || assets[0]);
    setWithdrawalOpen(true);
  };
  const handleCloseWithdrawal = () => setWithdrawalOpen(false);

  const handleOpenInternalWithdrawal = (asset) => {
    setSelectedAssetForModal(asset || assets[0]);
    setInternalWithdrawalOpen(true);
  };
  const handleCloseInternalWithdrawal = () => setInternalWithdrawalOpen(false);

  const handleOpenBuySell = (type, asset) => {
    setTransactionType(type || 'buy');
    setSelectedAssetForModal(asset || assets[0]);
    setBuySellOpen(true);
  };
  const handleCloseBuySell = () => setBuySellOpen(false);

  const modalAssets = selectedAssetForModal
    ? [selectedAssetForModal, ...assets.filter((a) => a.coinId !== selectedAssetForModal.coinId)]
    : assets;

  return (
    <div className="wallet-page-root">
      <div className="wallet-page-wrapper">
        
        {/* Navigation & Breadcrumb */}
        <div className="wallet-breadcrumb">
          <Link to="/dashboard" className="back-link">
            <HiArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <span className="separator">/</span>
          <span className="current">Wallet Overview</span>
        </div>

        {/* Hero Section */}
        <div className="wallet-hero-card">
          <div className="hero-balance-info">
            <div className="hero-tag">
              <FaWallet className="wallet-icon" />
              <span>Total Estimated Portfolio Value</span>
            </div>
            <div className="hero-amount-wrap">
              <span className="currency-sign">{currencySign}</span>
              <span className="balance-value">
                {isUsd
                  ? formatNumberWithCommas(user?.totalUsdValue || 0)
                  : formatNumberWithCommas(user?.totalNairaValue || 0)}
              </span>
            </div>
            <p className="hero-subtext">
              Holdings across <strong>{assets.length}</strong> active assets in your Ezabay account
            </p>
          </div>

          <div className="hero-quick-actions">
            <button className="action-pill primary" onClick={() => handleOpenSend()}>
              <HiArrowUpCircle size={20} />
              <span>Send</span>
            </button>
            <button className="action-pill primary" onClick={() => handleOpenDeposit()}>
              <HiArrowDownCircle size={20} />
              <span>Receive</span>
            </button>
            <button className="action-pill outline" onClick={() => handleOpenBuySell('buy')}>
              <HiMiniShoppingCart size={20} />
              <span>Buy / Sell</span>
            </button>
            <Link to="/transactions" className="action-pill outline history-link">
              <HiClock size={19} />
              <span>History</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Assets Table + Listed Tokens Sidebar */}
        <div className="wallet-layout-grid">
          
          {/* Left Column: Owned Assets */}
          <div className="wallet-holdings-card">
            <div className="card-header">
              <div className="header-title">
                <h3>My Assets</h3>
                <span className="asset-count-badge">{filteredAssets.length}</span>
              </div>
              
              <div className="header-controls">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={hideZeroBalances}
                    onChange={(e) => setHideZeroBalances(e.target.checked)}
                  />
                  <span>Hide 0 balances</span>
                </label>
                <div className="search-wrap">
                  <HiMagnifyingGlass className="search-icon" size={17} />
                  <input
                    type="text"
                    placeholder="Search holdings..."
                    value={searchHoldings}
                    onChange={(e) => setSearchHoldings(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="holdings-table-container">
              {filteredAssets.length === 0 ? (
                <div className="empty-holdings-state">
                  <FaWallet size={40} className="empty-icon" />
                  <h4>No Assets Found</h4>
                  <p>
                    {assets.length === 0
                      ? 'You have not added any crypto assets yet. Add assets from the list on the right to start transacting.'
                      : 'No holdings match your search query.'}
                  </p>
                </div>
              ) : (
                <div className="holdings-cards-container">
                  <div className="holdings-cards-header">
                    <span className="th-asset">Asset</span>
                    <span className="th-holdings">Holdings</span>
                    <span className="th-value">Estimated Value</span>
                    <span className="th-change">24h Change</span>
                    <span className="th-actions">Actions</span>
                  </div>
                  <div className="holdings-cards-list">
                    {filteredAssets.map((asset) => {
                      const balance = asset.balance || 0;
                      const fiatWorth = isUsd
                        ? balance * (asset.usdValue || 0)
                        : balance * (asset.nairaValue || 0);
                      const isNegative = (asset.percentageChange || 0) < 0;

                      return (
                        <div key={asset.coinId} className="asset-holding-card">
                          <div className="asset-card-identity">
                            <img src={asset.image} alt={asset.symbol} className="asset-avatar" />
                            <div className="asset-meta">
                              <span className="symbol">{asset.symbol?.toUpperCase()}</span>
                              <span className="name">{asset.currency || asset.symbol}</span>
                            </div>
                          </div>

                          <div className="asset-card-holdings">
                            <span className="mobile-label">Holdings</span>
                            <div className="holding-value-box">
                              <span className="amount">{balance.toFixed(4)}</span>
                              <span className="unit">{asset.symbol?.toUpperCase()}</span>
                            </div>
                          </div>

                          <div className="asset-card-value">
                            <span className="mobile-label">Est. Value</span>
                            <span className="fiat-val">
                              {currencySign}
                              {formatNumberWithCommas(fiatWorth)}
                            </span>
                          </div>

                          <div className="asset-card-change">
                            <span className="mobile-label">24h Change</span>
                            <span className={`change-pill ${isNegative ? 'negative' : 'positive'}`}>
                              {isNegative ? '↓' : '↑'} {Math.abs(asset.percentageChange || 0).toFixed(2)}%
                            </span>
                          </div>

                          <div className="asset-card-actions">
                            <button
                              className="btn-action-icon"
                              title={`Send ${asset.symbol}`}
                              onClick={() => handleOpenSend(asset)}
                            >
                              <HiArrowUpCircle size={18} />
                            </button>
                            <button
                              className="btn-action-icon"
                              title={`Receive ${asset.symbol}`}
                              onClick={() => handleOpenDeposit(asset)}
                            >
                              <HiArrowDownCircle size={18} />
                            </button>
                            <button
                              className="btn-action-icon"
                              title={`Buy/Sell ${asset.symbol}`}
                              onClick={() => handleOpenBuySell('buy', asset)}
                            >
                              <HiMiniShoppingCart size={18} />
                            </button>
                            <button
                              className="btn-action-icon hide-asset-btn"
                              title={`Hide ${asset.symbol?.toUpperCase()} from wallet`}
                              onClick={() => hideTokenFromWallet(asset.coinId, asset.symbol)}
                              disabled={actionLoading}
                            >
                              <FaRegEyeSlash size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Available / Listed Tokens */}
          <div className="wallet-market-card">
            <div className="card-header">
              <div className="header-title">
                <h3>Add Assets</h3>
                <span className="sub">Explore available tokens</span>
              </div>
            </div>

            <div className="market-search-box">
              <HiMagnifyingGlass className="search-icon" size={17} />
              <input
                type="text"
                placeholder="Search token by name or symbol..."
                value={searchMarket}
                onChange={(e) => setSearchMarket(e.target.value)}
              />
            </div>

            <div className="market-list-container">
              {loading ? (
                <div className="market-loading-state">
                  <Loader />
                  <span>Loading tokens...</span>
                </div>
              ) : error ? (
                <div className="market-error-state">{error}</div>
              ) : filteredMarketTokens.length === 0 ? (
                <div className="market-empty-state">No matching tokens found</div>
              ) : (
                filteredMarketTokens.map((coin) => {
                  const added = isAssetAdded(coin.id);
                  const price = isUsd ? coin.current_price : coin.current_price;

                  const isFinalized = FINALIZED_PRODUCTION_COINS.some(
                    (c) => c.toLowerCase() === coin.id?.toLowerCase() || c.toLowerCase() === coin.symbol?.toLowerCase()
                  );

                  return (
                    <div key={coin.id} className="market-token-row">
                      <div className="token-info">
                        <img src={coin.image} alt={coin.name} className="token-img" />
                        <div className="token-text">
                          <span className="token-name">{coin.name}</span>
                          <span className="token-symbol">{coin.symbol?.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="token-pricing">
                        <span className="token-price">
                          {currencySign}
                          {formatNumberWithCommas(price || 0)}
                        </span>
                      </div>

                      <div className="token-action">
                        {added ? (
                          <span className="status-added" title="Already added to your portfolio">
                            <HiCheck size={14} /> Added
                          </span>
                        ) : !isFinalized ? (
                          <button
                            className="btn-add-token disabled"
                            disabled={true}
                            title="Coming soon to production"
                            type="button"
                          >
                            Coming Soon
                          </button>
                        ) : (
                          <button
                            className="btn-add-token"
                            onClick={() => addTokenToWallet(coin.id)}
                            disabled={actionLoading}
                            type="button"
                          >
                            <HiPlus size={14} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="wallet-page-footer">
          <p>Ezabay Exchange &bull; Fast, Secure Crypto & Fiat Wallet</p>
        </div>

      </div>

      {/* Interactive Modals */}
      {isOpen && (
        <DepositHiveModal
          isOpen={isOpen}
          assets={modalAssets}
          onClose={handleCloseDeposit}
          user={user}
        />
      )}



      {buySellOpen && (
        <BuySell
          isOpen={buySellOpen}
          onClose={handleCloseBuySell}
          assets={modalAssets}
          transactionType={transactionType}
          setTransactionType={setTransactionType}
        />
      )}

      {withdrawalOpen && (
        <WithdrawalModal
          isOpen={withdrawalOpen}
          assets={modalAssets}
          onClose={handleCloseWithdrawal}
          user={user}
        />
      )}

      {internalWithdrawalOpen && (
        <InternalTransferModal
          isOpen={internalWithdrawalOpen}
          assets={modalAssets}
          onClose={handleCloseInternalWithdrawal}
          user={user}
        />
      )}

      {sendOptionsOpen && (
        <SendOptions
          isOpen={sendOptionsOpen}
          onClose={handleCloseSend}
          internalOpen={handleOpenInternalWithdrawal}
          openOnchain={handleOpenWithdrawal}
        />
      )}

    </div>
  );
};
export default WalletPage;

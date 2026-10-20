import React, { useState, useRef, useEffect } from 'react';
import { HiCheck, HiMagnifyingGlass } from 'react-icons/hi2';
import "./dropdown.scss";

export const Dropdown = (props) => {
  const { user, handleOpencoinList, setCurrency, openList, displaySearch, selectedCurrency } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openList && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Only close if click is not inside the toggle button
        const isToggleClick = event.target.closest('.d-currency-select-wrap, .get-select-wrap, .w-currency-select-wrap');
        if (!isToggleClick) {
          handleOpencoinList();
        }
      }
    };

    if (openList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openList, handleOpencoinList]);

  if (!openList) return null;

  const assets = user?.assets || [];

  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase();
    const symbol = (asset.symbol || '').toLowerCase();
    const currency = (asset.currency || '').toLowerCase();
    return symbol.includes(q) || currency.includes(q);
  });

  const formatName = (asset) => {
    if (asset.currency === 'hive_dollar' || asset.currency === 'hbd') return 'Hive Dollar';
    if (asset.currency === 'hive') return 'Hive';
    if (asset.currency === 'bitcoin' || asset.currency === 'btc') return 'Bitcoin';
    return asset.currency ? asset.currency.charAt(0).toUpperCase() + asset.currency.slice(1) : '';
  };

  return (
    <div className="modern-coin-dropdown-popover" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      {(displaySearch || assets.length > 3) && (
        <div className="dropdown-search-wrapper">
          <HiMagnifyingGlass className="search-icon" size={15} />
          <input
            className="dropdown-search-field"
            type="text"
            placeholder="Search coin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="coin-options-list">
        {filteredAssets.length === 0 ? (
          <div className="empty-dropdown-message">No assets match search</div>
        ) : (
          filteredAssets.map((asset, index) => {
            const isSelected =
              selectedCurrency?.currency === asset.currency ||
              selectedCurrency?.symbol === asset.symbol;
            const symbol = (asset.symbol || asset.currency || '').toUpperCase();
            const friendlyName = formatName(asset);
            const balance = asset.balance != null ? Number(asset.balance).toLocaleString(undefined, { maximumFractionDigits: 4 }) : null;

            return (
              <div
                key={asset.coinId || asset.currency || index}
                className={`coin-option-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setCurrency(asset);
                  handleOpencoinList();
                }}
              >
                <div className="coin-avatar-wrap">
                  {asset.image ? (
                    <img className="coin-avatar-img" src={asset.image} alt={symbol} />
                  ) : (
                    <div className="coin-avatar-placeholder">{symbol.slice(0, 2)}</div>
                  )}
                </div>

                <div className="coin-label-block">
                  <span className="coin-symbol-text">{symbol}</span>
                  <span className="coin-name-text">{friendlyName}</span>
                </div>

                <div className="coin-balance-block">
                  {balance && <span className="coin-bal-val">{balance}</span>}
                  {isSelected && <HiCheck size={16} className="selected-check-icon" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

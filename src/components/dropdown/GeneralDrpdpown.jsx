import React, { useState, useRef, useEffect } from 'react';
import { RiArrowDownSFill, RiBankFill } from 'react-icons/ri';
import { HiCheck, HiMagnifyingGlass } from 'react-icons/hi2';
import "./general.scss";

export const GeneralDropdown = (props) => {
  const { items, handleOpenList, setSelectedItem, itemName, openList, selectLabal } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openList && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const isTriggerClick = event.target.closest('.gd-item-select-wrap');
        if (!isTriggerClick) {
          handleOpenList();
        }
      }
    };

    if (openList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openList, handleOpenList]);

  const filteredItems = items?.filter((item) => {
    const q = searchQuery.toLowerCase();
    const str = `${item.bankName || ''} ${item.accountName || ''} ${item.accountNumber || ''} ${item.name || ''} ${typeof item === 'string' ? item : ''}`.toLowerCase();
    return str.includes(q);
  });

  // Calculate display label for trigger
  const getDisplayTitle = () => {
    if (typeof itemName === 'string' && itemName.trim()) return itemName;
    if (itemName?.bankName) return itemName.bankName;
    if (itemName?.name) return itemName.name;
    return `Select ${selectLabal || 'Option'}`;
  };

  return (
    <div className="gd-container" ref={dropdownRef}>
      <div className={`gd-item-select-wrap ${openList ? 'active-open' : ''}`} onClick={handleOpenList}>
        <div className="gd-trigger-left">
          {itemName?.image ? (
            <img className="gd-select-image" src={itemName.image} alt="" />
          ) : (
            <RiBankFill size={18} className="gd-trigger-icon" />
          )}
          <span className="gd-select-title">{getDisplayTitle()}</span>
        </div>
        <RiArrowDownSFill size={20} className={`gd-caret-icon ${openList ? 'open' : ''}`} />
      </div>

      {openList && (
        <div className="gd-popover-menu" onClick={(e) => e.stopPropagation()}>
          {items?.length > 4 && (
            <div className="gd-search-wrap">
              <HiMagnifyingGlass className="search-icon" size={15} />
              <input
                className="gd-search-input"
                type="text"
                placeholder={`Search ${selectLabal || 'options'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="gd-items-scroll-list">
            {(!filteredItems || filteredItems.length === 0) ? (
              <div className="gd-empty-message">No options available</div>
            ) : (
              filteredItems.map((item, index) => {
                const isBankAcc = item.bankName || item.accountNumber;
                const isSelected =
                  itemName === item.bankName ||
                  itemName === item.name ||
                  itemName === item ||
                  itemName?.accountNumber === item.accountNumber;

                return (
                  <div
                    className={`gd-item-picker-row ${isSelected ? 'selected' : ''}`}
                    key={item._id || item.accountNumber || index}
                    onClick={() => {
                      setSelectedItem(item);
                      handleOpenList();
                    }}
                  >
                    <div className="gd-row-main">
                      <div className="gd-row-icon-wrap">
                        {item.image ? (
                          <img className="gd-select-image" src={item.image} alt="" />
                        ) : (
                          <RiBankFill size={16} className="gd-item-icon" />
                        )}
                      </div>

                      <div className="gd-row-text">
                        <span className="gd-row-title">{item.bankName || item.name || item}</span>
                        {item.accountName && (
                          <span className="gd-row-subtitle">{item.accountName}</span>
                        )}
                      </div>
                    </div>

                    <div className="gd-row-extra">
                      {item.accountNumber && (
                        <span className="gd-account-badge">{item.accountNumber}</span>
                      )}
                      {isSelected && <HiCheck size={16} className="selected-check" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

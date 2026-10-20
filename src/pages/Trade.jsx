import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usdPrice } from '../utils';
import debounce from 'lodash/debounce';
import { useDispatch, useSelector } from 'react-redux';
import './trade.scss';
import { buyAsset, sellAsset, calculateTransaction } from '../api/ekzat';
import { Loader } from '../components/loader/Loader';
import { getUserProfile } from '../api/profile';
import { formatNumbers } from '../utils';

export const Trade = ({ isOpen, onClose, assets }) => {
  const global = useSelector(state => state.ekzaUser);
  const cur = useSelector(state => state.currency);
  const { user } = global;
  const isUsd = cur.selectedCurrency === "USD";

  const [currency, setCurrency] = useState(user.assets[0]?.currency || '');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('crypto');
  const [transactionType, setTransactionType] = useState('buy');
  const [message, setMessage] = useState('');
  const [conversionResult, setConversionResult] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedAssetBalance, setSelectedAssetBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const selectedAsset = user.assets.find(asset => asset.currency === currency);
    setSelectedAssetBalance(selectedAsset ? selectedAsset.balance : 0);
  }, [currency, user.assets]);

  useEffect(() => {
    if (amount) debouncedHandleCalculate(amount);
  }, [currency, amountType]);

  const debouncedHandleCalculate = useCallback(
    debounce((a) => {
      handleCalculate(a);
    }, 1000),
    [currency, amountType, transactionType]
  );

  useEffect(() => {
    if (!amount) setConversionResult(null);
    debouncedHandleCalculate(amount);
  }, [amount]);

  const handleCalculate = async (a) => {
    if (!a) {
      setConversionResult(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    setMessage('');
    setConversionResult(null);

    try {
      const conversionData = await calculateTransaction({
        amount: a,
        currency,
        amountType,
        transactionType,
        signal,
      });
      if (conversionData.success === true) {
        setConversionResult(conversionData);
        setIsLoading(false);
      } else {
        setConversionResult(null);
        setIsLoading(false);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        setMessage(error.message || 'An error occurred during calculation');
      }
      setIsLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount)) {
      setMessage('Please enter a valid amount');
      return;
    }

    const amountNumber = Number(amount);

    if (amountType === 'fiat') {
      if (amountNumber < 500) {
        setMessage('Amount must not be less than 500 Naira');
        return;
      }
    } else if (amountType === 'crypto') {
      if (!conversionResult || conversionResult.convertedAmount < 500) {
        setMessage('The equivalent amount in Naira must be at least 500');
        return;
      }
    }

    setIsLoading(true);
    setMessage('');

    try {
      const transactionData = {
        amount: transactionType === 'buy'
          ? (amountType === 'fiat' ? Number(amountNumber) : Number(conversionResult?.convertedCryptoAmount?.split(" ")[0]))
          : (amountType === 'fiat' ? Number(conversionResult?.convertedCryptoAmount?.split(" ")[0]) : Number(amountNumber)),
        currency,
        amountType
      };

      if (transactionType === 'buy') {
        await buyAsset(transactionData);
      } else if (transactionType === 'sell') {
        await sellAsset(transactionData);
      }
      getUserProfile(dispatch);
      setStep(2);
    } catch (error) {
      setMessage(error.message || 'An error occurred during the transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    let newAmount = e.target.value.replace(/[^0-9.]/g, '');
    if ((newAmount.match(/\./g) || []).length > 1) {
      newAmount = newAmount.slice(0, -1);
    }

    if (newAmount === '') {
      setConversionResult(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    setAmount(newAmount);
  };

  const toggleAmountType = () => {
    setAmountType(prevType => (prevType === 'crypto' ? 'fiat' : 'crypto'));
  };

  return (
    <div className='trade-main-container'>
      <div className={`trade-container ${isOpen ? 'open' : ''}`}>
        {isLoading && <Loader />}
        {step === 1 && (
          <div className='trade-step-1'>
            <h2 className="trade-header">{transactionType === 'buy' ? 'Buy' : 'Sell'} Assets</h2>
            <div className="trade-toggle-buttons">
              <button
                className={`trade-btn ${transactionType === 'buy' ? 'active' : ''}`}
                onClick={() => setTransactionType('buy')}
              >
                Buy
              </button>
              <button
                className={`trade-btn ${transactionType === 'sell' ? 'active' : ''}`}
                onClick={() => setTransactionType('sell')}
              >
                Sell
              </button>
            </div>
            <div className="trade-amount-type-toggle">
              <button
                className="trade-btn"
                onClick={toggleAmountType}
              >
                {amountType === 'crypto' ? 'Switch to Fiat' : 'Switch to Crypto'}
              </button>
            </div>
            <div className="trade-balance-info">
              <h2>
                <span className="trade-currency-symbol">{isUsd ? "$" : "N"}</span>
                {isUsd ? (user?.nairaBalance / usdPrice)?.toFixed(3) : user?.nairaBalance.toFixed(3)}
              </h2>
            </div>
            {message && <p className='trade-warning'>{message}</p>}

            <div className="trade-input-group">
              <h3>Balance: {formatNumbers(selectedAssetBalance)} {currency.toUpperCase()}</h3>
              <div className="trade-currency-wrap">
                {amountType === "fiat" ? (
                  <h1>NGN</h1>
                ) : (
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {user.assets.map((asset) => (
                      <option key={asset.currency} value={asset.currency}>
                        {asset.currency.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  id="amount"
                  min="0"
                  step="any"
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                  }}
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder={`Enter ${amountType === 'fiat' ? 'Naira' : currency.toUpperCase()} amount`}
                />
              </div>
              <div className="trade-estimation-wrap">
                <div className='trade-estimation'>
                  {amountType === "crypto" ? (
                    <h1>NGN</h1>
                  ) : (
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {user.assets.map((asset) => (
                        <option key={asset.currency} value={asset.currency}>
                          {asset.currency.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                  <h2>{amountType === "crypto" ? conversionResult?.convertedNairaAmount : conversionResult?.convertedCryptoAmount}</h2>
                </div>
                <hr />
                {(conversionResult || amount) && (
                  <div className="trade-summary">
                    <h4>Transaction Summary</h4>
                    {transactionType === 'buy' ? (
                      <>
                        {!conversionResult ? (
                          <>
                            <p>Amount: Calculating...</p>
                            <p>Fee: Calculating...</p>
                            <p>You will get: Calculating...</p>
                          </>
                        ) : (
                          <>
                            <p>Amount: {conversionResult?.cryptoAmount} ({conversionResult?.convertedNairaAmount})</p>
                            <p>Fee: {conversionResult?.cryptoFee} ({conversionResult?.fiatFee})</p>
                            <p>You will get: {conversionResult?.cryptoAmountAfterFee} ({conversionResult?.fiatAmountAfterFee})</p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {!conversionResult ? (
                          <>
                            <p>Amount: Calculating...</p>
                            <p>Fee: Calculating...</p>
                            <p>You will receive: Calculating...</p>
                          </>
                        ) : (
                          <>
                            <p>Amount: {conversionResult?.fiatAmount} ({conversionResult?.cryptoAmount})</p>
                            <p>Fee: {conversionResult?.fiatFee} ({conversionResult?.cryptoFee})</p>
                            <p>You will receive: {conversionResult?.fiatAmountAfterFee} ({conversionResult?.cryptoAmountAfterFee})</p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button className="trade-submit-btn" onClick={handleTransaction}>Confirm</button>
          </div>
        )}

        {step === 2 && (
          <div className='trade-step-2'>
            <h2>Transaction Complete</h2>
            <p>Your transaction has been successfully processed.</p>
            <button className="trade-back-btn" onClick={() => setStep(1)}>Finished</button>
          </div>
        )}
      </div>
    </div>
  );
};

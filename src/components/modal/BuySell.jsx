import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Loader } from '../loader/Loader';
import { IoClose } from 'react-icons/io5';
import debounce from 'lodash/debounce';
import { useDispatch, useSelector } from 'react-redux';
import './buysell.scss';
import { buyAsset, sellAsset, calculateTransaction } from '../../api/ekzat';
import { formatNumbers, getFirstItem, formatNumberWithCommas } from '../../utils';
import { getUserProfile } from '../../api/profile';
import { RiArrowDownSFill, RiArrowRightSFill } from 'react-icons/ri';
import nigeria from '../../assets/nigria.png';
import { TbArrowsExchange2 } from 'react-icons/tb';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { HiCheckCircle } from 'react-icons/hi2';
import { Dropdown } from '../dropdown/Dropdown';
import Spinner from '../spinner/Spinner';

export const BuySell = ({ isOpen, onClose, assets, transactionType, setTransactionType }) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.ekzaUser?.user);
  const globalCurrency = useSelector((state) => state.currency);

  const [openList, setOpenList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState(assets?.[0] || {});
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('crypto');
  const [message, setMessage] = useState('');
  const [conversionResult, setConversionResult] = useState(null);
  const [step, setStep] = useState(1);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    if (assets && assets.length > 0 && !currency?.currency) {
      setCurrency(assets[0]);
    }
  }, [assets]);

  const abortControllerRef = useRef(null);

  const debouncedHandleCalculate = useCallback(
    debounce((a) => {
      handleCalculate(a);
    }, 800),
    [currency, amountType, transactionType]
  );

  useEffect(() => {
    if (!amount) setConversionResult(null);
    setConversionResult(null);
    debouncedHandleCalculate(amount);
  }, [amount, currency, transactionType]);

  const handleCalculate = async (a) => {
    if (!a || isNaN(a) || Number(a) <= 0) {
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
        currency: currency.currency,
        amountType,
        transactionType,
        signal,
      });
      if (conversionData?.success) {
        setConversionResult(conversionData);
      } else {
        setConversionResult(null);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        setMessage(error.message || 'An error occurred during calculation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setDisable(true);

    if (!amount || isNaN(amount)) {
      setMessage('Please enter a valid amount');
      setDisable(false);
      return;
    }

    const amountNumber = Number(amount);

    if (amountType === 'fiat') {
      if (amountNumber < 500) {
        setMessage('Amount must not be less than ₦500');
        setDisable(false);
        return;
      }
    } else if (amountType === 'crypto') {
      if (!conversionResult || conversionResult.convertedAmount < 500) {
        setMessage('The equivalent amount in Naira must be at least ₦500');
        setDisable(false);
        return;
      }
    }

    setIsLoading(true);
    setMessage('');

    try {
      const transactionData = {
        amount:
          transactionType === 'buy'
            ? amountType === 'fiat'
              ? Number(amountNumber)
              : Number(conversionResult?.convertedCryptoAmount?.split(' ')[0])
            : amountType === 'fiat'
            ? Number(conversionResult?.convertedCryptoAmount?.split(' ')[0])
            : Number(amountNumber),
        currency: currency.currency,
        amountType,
      };

      if (transactionType === 'buy') {
        await buyAsset(transactionData);
      } else if (transactionType === 'sell') {
        await sellAsset(transactionData);
      }
      getUserProfile(dispatch);
      setStep(3);
    } catch (error) {
      setMessage(error.message || 'An error occurred during the transaction');
    } finally {
      setIsLoading(false);
      setDisable(false);
    }
  };

  const handleCryptoAmountChange = (e) => {
    let newAmount = e.target.value.replace(/[^0-9.]/g, '');
    if ((newAmount.match(/\./g) || []).length > 1) {
      newAmount = newAmount.slice(0, -1);
    }
    setAmountType('crypto');
    setAmount(newAmount);

    if (newAmount === '') {
      setConversionResult(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      debouncedHandleCalculate(newAmount);
    }
  };

  const handleNairaAmountChange = (e) => {
    let newAmount = e.target.value.replace(/[^0-9.]/g, '');
    if ((newAmount.match(/\./g) || []).length > 1) {
      newAmount = newAmount.slice(0, -1);
    }
    setAmountType('fiat');
    setAmount(newAmount);

    if (newAmount === '') {
      setConversionResult(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      debouncedHandleCalculate(newAmount);
    }
  };

  const handleMaxCrypto = () => {
    if (currency?.balance) {
      const maxVal = parseFloat(currency.balance).toFixed(4);
      setAmountType('crypto');
      setAmount(maxVal);
      debouncedHandleCalculate(maxVal);
    }
  };

  const handleMaxFiat = () => {
    if (user?.nairaBalance) {
      const maxVal = parseFloat(user.nairaBalance).toFixed(2);
      setAmountType('fiat');
      setAmount(maxVal);
      debouncedHandleCalculate(maxVal);
    }
  };

  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

  const handleCloseModal = () => {
    setStep(1);
    setAmount('');
    setConversionResult(null);
    setMessage('');
    onClose();
  };

  const activeRate =
    globalCurrency?.selectedCurrency?.name === 'USD'
      ? currency?.usdValue
      : currency?.nairaValue;

  return (
    <div className={`b-s-modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="b-s-modal">
        {step === 2 && (
          <div className="backmodal" onClick={() => setStep(1)} title="Back to edit">
            <IoIosArrowRoundBack size={24} />
          </div>
        )}

        <button className="close-modal" onClick={handleCloseModal} title="Close">
          <IoClose size={18} />
        </button>

        {isLoading && <Loader />}

        <div className="buysell-container">
          {step === 1 && (
            <>
              {/* Buy / Sell Toggle Tabs */}
              <div className="toggle-buttons">
                <button
                  type="button"
                  className={`buy-sell-btn ${transactionType === 'buy' ? 'active' : ''}`}
                  onClick={() => setTransactionType('buy')}
                >
                  Buy {currency?.symbol?.toUpperCase() || 'Crypto'}
                </button>
                <button
                  type="button"
                  className={`buy-sell-btn ${transactionType === 'sell' ? 'active' : ''}`}
                  onClick={() => setTransactionType('sell')}
                >
                  Sell {currency?.symbol?.toUpperCase() || 'Crypto'}
                </button>
              </div>

              {message && <p className="warning">{message}</p>}

              <div className="buy-sell-parent-wrap">
                {/* Fiat Field */}
                <div className="spend-wrap">
                  <div className="input-card-top">
                    <h3>{transactionType === 'buy' ? 'You Pay' : 'You Receive'}</h3>
                    <div className="bal-display">
                      <span>NGN Balance:</span>
                      <span className="bal-val">
                        ₦{formatNumberWithCommas(user?.nairaBalance || 0)}
                      </span>
                      {transactionType === 'buy' && (
                        <span className="btn-max" onClick={handleMaxFiat}>
                          MAX
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="spend-component">
                    <input
                      type="number"
                      placeholder="0.00"
                      id="fiat-amount"
                      min="0"
                      step="any"
                      onKeyDown={(e) => {
                        if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                      }}
                      value={
                        amountType === 'fiat'
                          ? amount
                          : getFirstItem(conversionResult?.convertedNairaAmount) || ''
                      }
                      onChange={handleNairaAmountChange}
                    />
                    <div className="spend-select-wrap">
                      <img src={nigeria} alt="NGN" />
                      <span>NGN</span>
                    </div>
                  </div>
                </div>

                {/* Live Rate Chip */}
                <div className="rate-wrap">
                  <TbArrowsExchange2 className="rate-icon" size={16} />
                  <span>
                    1 {currency?.currency?.toUpperCase() || 'CRYPTO'} ≈{' '}
                    ₦{formatNumberWithCommas(activeRate || 0)}
                  </span>
                </div>

                {/* Crypto Field */}
                <div className="get-wrap">
                  <div className="input-card-top">
                    <h3>{transactionType === 'buy' ? 'You Receive' : 'You Pay'}</h3>
                    <div className="bal-display">
                      <span>{currency?.symbol?.toUpperCase() || 'Crypto'} Balance:</span>
                      <span className="bal-val">
                        {parseFloat(currency?.balance || 0).toFixed(4)}
                      </span>
                      {transactionType === 'sell' && (
                        <span className="btn-max" onClick={handleMaxCrypto}>
                          MAX
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="get-component">
                    <input
                      type="number"
                      placeholder="0.00"
                      id="crypto-amount"
                      min="0"
                      step="any"
                      onKeyDown={(e) => {
                        if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                      }}
                      value={
                        amountType === 'crypto'
                          ? amount
                          : getFirstItem(conversionResult?.convertedCryptoAmount) || ''
                      }
                      onChange={handleCryptoAmountChange}
                    />
                    <div className="get-select-wrap" onClick={handleOpencoinList}>
                      {currency?.image && <img src={currency.image} alt={currency.currency} />}
                      <span>{currency?.symbol || currency?.currency || 'SELECT'}</span>
                      <RiArrowDownSFill size={18} />
                    </div>
                  </div>

                  <Dropdown
                    user={user}
                    setCurrency={setCurrency}
                    handleOpencoinList={handleOpencoinList}
                    openList={openList}
                    selectedCurrency={currency}
                  />
                </div>

                {/* Breakdown Summary */}
                <div className="fees-review">
                  <div className="fees-rap">
                    <span>Order Value</span>
                    {!conversionResult ? (
                      <span>{!amount ? '---' : 'Calculating...'}</span>
                    ) : (
                      <span>
                        {transactionType === 'buy'
                          ? `${conversionResult?.cryptoAmount} (${conversionResult?.convertedNairaAmount})`
                          : `${conversionResult?.convertedNairaAmount} (${conversionResult?.convertedCryptoAmount})`}
                      </span>
                    )}
                  </div>
                  <div className="fees-rap">
                    <span>Estimated Fee</span>
                    {!conversionResult ? (
                      <span>{!amount ? '---' : 'Calculating...'}</span>
                    ) : (
                      <span>
                        {conversionResult?.fiatFee
                          ? `₦${conversionResult.fiatFee}`
                          : 'Zero Fee'}
                      </span>
                    )}
                  </div>
                  <div className="fees-rap">
                    <span>Trading Bonus</span>
                    <span>0.000</span>
                  </div>
                  <div className="fees-rap total-row">
                    <span>You Will Get</span>
                    {!conversionResult ? (
                      <span>{!amount ? '---' : 'Calculating...'}</span>
                    ) : (
                      <span>
                        {transactionType === 'buy'
                          ? conversionResult?.cryptoAmountAfterFee || conversionResult?.cryptoAmount
                          : conversionResult?.fiatAmountAfterFee || conversionResult?.convertedNairaAmount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="buy-sell-btn-wrap">
                  <button
                    type="button"
                    className="buy-sell-btn-main"
                    onClick={() => setStep(2)}
                    disabled={isLoading || !amount || !conversionResult}
                  >
                    {isLoading ? 'Calculating Rate...' : `Review ${transactionType === 'buy' ? 'Purchase' : 'Sale'}`}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="review-buy-sell">
              <div className="modal-title-wrap">
                <h2>Confirm {transactionType === 'buy' ? 'Buy Order' : 'Sell Order'}</h2>
              </div>

              {message && <p className="warning">{message}</p>}

              <div className="review-box-wrap">
                <div className="box-left">
                  <span className="review-label">
                    {transactionType === 'buy' ? 'You Pay' : 'You Sell'}
                  </span>
                  <div className="review-coin-wrap">
                    <img src={transactionType === 'buy' ? nigeria : currency.image} alt="" />
                    <span>
                      {transactionType === 'buy'
                        ? conversionResult?.convertedNairaAmount?.split(' ')[0]
                        : conversionResult?.convertedCryptoAmount?.split(' ')[0]}
                    </span>
                  </div>
                  <span className="sub-val">
                    {transactionType === 'buy' ? 'NGN' : currency.symbol?.toUpperCase()}
                  </span>
                </div>

                <div className="exchange-circle">
                  <TbArrowsExchange2 size={20} />
                </div>

                <div className="box-left">
                  <span className="review-label">You Receive</span>
                  <div className="review-coin-wrap">
                    <img src={transactionType === 'buy' ? currency.image : nigeria} alt="" />
                    <span>
                      {transactionType === 'buy'
                        ? conversionResult?.cryptoAmountAfterFee?.split(' ')[0] ||
                          conversionResult?.cryptoAmount?.split(' ')[0]
                        : conversionResult?.fiatAmountAfterFee?.split(' ')[0] ||
                          conversionResult?.convertedNairaAmount?.split(' ')[0]}
                    </span>
                  </div>
                  <span className="sub-val">
                    {transactionType === 'buy' ? currency.symbol?.toUpperCase() : 'NGN'}
                  </span>
                </div>
              </div>

              <div className="fees-review">
                <div className="fees-rap">
                  <span>Order Type</span>
                  <span>Instant Market</span>
                </div>
                <div className="fees-rap">
                  <span>Exchange Rate</span>
                  <span>
                    1 {currency?.currency?.toUpperCase()} = ₦{formatNumberWithCommas(activeRate || 0)}
                  </span>
                </div>
                <div className="fees-rap">
                  <span>Network Fee</span>
                  <span>{conversionResult?.fiatFee ? `₦${conversionResult.fiatFee}` : 'Zero Fee'}</span>
                </div>
                <div className="fees-rap total-row">
                  <span>Total To Receive</span>
                  <span>
                    {transactionType === 'buy'
                      ? conversionResult?.cryptoAmountAfterFee || conversionResult?.cryptoAmount
                      : conversionResult?.fiatAmountAfterFee || conversionResult?.convertedNairaAmount}
                  </span>
                </div>
              </div>

              <div className="buy-btn-wrap">
                <button
                  type="button"
                  onClick={handleTransaction}
                  disabled={disable}
                  className="buy-sell-btn-main"
                >
                  {disable ? <Spinner /> : `Confirm ${transactionType === 'buy' ? 'Buy' : 'Sell'}`}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="succe">
              <div className="success-icon-wrap">
                <HiCheckCircle size={44} />
              </div>
              <h3>Order Completed!</h3>
              <p>
                Your {transactionType === 'buy' ? 'purchase' : 'sale'} of{' '}
                <strong>{currency?.symbol?.toUpperCase()}</strong> was executed successfully.
              </p>
              <button type="button" onClick={handleCloseModal} className="btn-done">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BuySell;

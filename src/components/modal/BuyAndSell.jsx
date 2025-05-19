import React, { useState, useEffect, useCallback, useRef } from "react";
import { usdPrice } from "../../utils";
import debounce from "lodash/debounce";
import { useDispatch } from "react-redux";
import "./buy-and-sell.scss";
import { buyAsset, sellAsset, calculateTransaction } from "../../api/ekzat";
import { formatNumbers } from "../../utils";
import { useSelector } from "react-redux";
import { Loader } from "../loader/Loader";
import { getUserProfile } from "../../api/profile";
import { RiArrowDownSFill, RiArrowRightSFill } from "react-icons/ri";
import nigeria from "../../assets/nigria.png"
import Hive from "../../assets/hive-logo.png"
import tusd from "../../assets/tusd.svg"
import usdc from "../../assets/usdc.svg"
import usdt from "../../assets/usdt.svg"
import { IoCloseSharp } from "react-icons/io5";
import { TbArrowsExchange2 } from "react-icons/tb";
import "./buy-and-sell.scss"

export const BuySellModal = ({
  isOpen,
  onClose,
  assets,
  transactionType,
  setTransactionType,
}) => {
  const [currency, setCurrency] = useState(assets[0]?.currency || "");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState("crypto");
  const [message, setMessage] = useState("");
  const [conversionResult, setConversionResult] = useState(null);
  const [step, setStep] = useState(1);
  const [newStep, setNewStep] = useState(1);
  const [selectedAssetBalance, setSelectedAssetBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [openList, setOpenList] = useState(false)


  const dispatch = useDispatch();

  const abortControllerRef = useRef(null);

  const global = useSelector((state) => state.ekzaUser);
  const cur = useSelector((state) => state.currency);
  const { user } = global;
  const isUsd = cur.selectedCurrency === "USD";

  useEffect(() => {
    const selectedAsset = user.assets.find(
      (asset) => asset.currency === currency
    );
    setSelectedAssetBalance(selectedAsset ? selectedAsset.balance : 0);
  }, [currency, user.assets]);
   
  
  const handleOpencoinList = ()=>{
    setOpenList(!openList)
  }
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
    setConversionResult(null);
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
    setMessage("");
    setConversionResult(null);

    try {
      const conversionData = await calculateTransaction({
        amount: a,
        currency,
        amountType,
        transactionType,
        signal, // Pass signal to fetch request
      });
      if (conversionData.success === true) {
        setConversionResult(conversionData);
        setIsLoading(false);
      } else {
        setConversionResult(null);
        setIsLoading(false);
      }
    } catch (error) {
      if (error.name === "AbortError") {
      } else {
        setMessage(error.message || "An error occurred during calculation");
      }
      setIsLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount)) {
      setMessage("Please enter a valid amount");
      return;
    }

    const amountNumber = Number(amount);

    if (amountType === "fiat") {
      if (amountNumber < 500) {
        setMessage("Amount must not be less than 500 Naira");
        return;
      }
    } else if (amountType === "crypto") {
      if (!conversionResult || conversionResult.convertedAmount < 500) {
        setMessage("The equivalent amount in Naira must be at least 500");
        return;
      }
    }

    setIsLoading(true);
    setMessage("");

    try {
      const transactionData = {
        amount:
          transactionType === "buy"
            ? amountType === "fiat"
              ? Number(amountNumber)
              : Number(conversionResult?.convertedCryptoAmount?.split(" ")[0])
            : amountType === "fiat"
            ? Number(conversionResult?.convertedCryptoAmount?.split(" ")[0])
            : Number(amountNumber),
        currency,
        amountType,
      };

      if (transactionType === "buy") {
        await buyAsset(transactionData);
      } else if (transactionType === "sell") {
        await sellAsset(transactionData);
      }
      getUserProfile(dispatch);
      setStep(2);
    } catch (error) {
      setMessage(error.message || "An error occurred during the transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value;

    if (newAmount === "") {
      setConversionResult(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    setAmount(newAmount);
  };

  const toggleAmountType = () => {
    setAmountType((prevType) => (prevType === "crypto" ? "fiat" : "crypto"));
  };
 const data = [
  {"img": nigeria, "name": "Btc"},
  {"img": Hive, "name": "Ltc"},
  {"img": usdc, "name": "Bnb"},
  {"img": usdt, "name": "Dash"},
 ]
  return (
    <div className={`fadded-container modal-overlay ${isOpen ? "open" : ""}`}>
      {/* <div
        className={`modal-overlay  ${isOpen ? "open" : ""}`}
        onClick={onClose}
      >
        {" "}
      </div>
      <div className="modal">
        <IoCloseSharp size={18} className="close-modal" onClick={onClose} />
        {isLoading && <Loader />}
        {step === 1 && (<>
          <h2>{transactionType === 'buy' ? 'Buy' : 'Sell'} Assets</h2>
          <div className="toggle-buttons">
            <button
              className={`${transactionType === 'buy' ? 'active btn' : 'trans'} btn buy-sell-btn`}
              onClick={() => setTransactionType('buy')}
            >
              Buy
            </button>
            <button
              className={`${transactionType === 'sell' ? 'active btn' : 'trans'} btn buy-sell-btn`}
              onClick={() => setTransactionType('sell')}
            >
              Sell
            </button>
          </div>
          <div className="amount-type-toggle">
            <button
              className={`active btn`}
              onClick={toggleAmountType}
            >
              {amountType === 'crypto' ? 'Switch to Fiat' : 'Switch to Crypto'}
            </button>
          </div>
          <div>
          <h2>
            <span className="strike-naira">{isUsd ? "$" : "N"}</span>
            {isUsd ? (user?.nairaBalance / usdPrice)?.toFixed(3) : user?.nairaBalance.toFixed(3)}
          </h2>
          </div>
          {message && <p className='warning'>{message}</p>}
         
            <div className="input-group">
              <h3>Balance: {formatNumbers(selectedAssetBalance)} {currency.toUpperCase()}</h3>
              <div className="currency-wrap">
                {amountType === "fiat" ?
                  <h1>NGN</h1> : <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {assets.map((asset) => (
                      <option key={asset.currency} value={asset.currency}>
                        {asset.currency.toUpperCase()}
                      </option>
                    ))}
                  </select>}
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder={`Enter ${amountType === 'fiat' ? 'Naira' : currency.toUpperCase()} amount`}
                />
              </div>
              <div className="est-wrap">
                <div className='est currency-wrap'>
                  {amountType === "crypto" ?
                    <h1>NGN</h1> : <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {assets.map((asset) => (
                        <option key={asset.currency} value={asset.currency}>
                          {asset.currency.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  }
                  <h2>{amountType === "crypto" ? conversionResult?.convertedNairaAmount : conversionResult?.convertedCryptoAmount}</h2>
                </div>
                <hr />
                {(conversionResult || amount) && (
                  <div className="step-2">
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
                            <p>You will get: Calculating...</p>
                          </>
                        ) : (
                          <>
                            <p>Amount: {(conversionResult?.convertedCryptoAmount)} ({conversionResult?.convertedNairaAmount})</p>
                            <p>Fee: {(conversionResult?.fiatFee)} Naira ({conversionResult?.cryptoFee})</p>
                            <p>You will get: {(conversionResult?.fiatAmountAfterFee)} ({conversionResult?.cryptoAmountAfterFee})</p>
                          </>
                        )}
                      </>
                    )}
                    <button
                      className="transaction-btn"
                      onClick={handleTransaction}
                      disabled={isLoading || !amount || !conversionResult}
                      style={{ cursor: isLoading || !amount || !conversionResult ? "not-allowed" : "pointer" }}
                    >
                      Confirm {transactionType === 'buy' ? 'Buy' : 'Sell'}
                    </button>
                  </div>
                )}

              </div>
            </div>
        </> )}
          {step === 2 && (
            <div className="succe">
              <h3>Transaction Successful</h3>
              <button onClick={onClose} className="btn">Close</button>
            </div>
          )}

        
      </div> */}
    </div>
  );
};

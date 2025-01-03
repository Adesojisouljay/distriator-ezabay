import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Loader } from '../loader/Loader'
import { IoCloseSharp } from 'react-icons/io5'
import debounce from "lodash/debounce";
import { useDispatch } from "react-redux";
import "./buysell.scss";
import { buyAsset, sellAsset, calculateTransaction } from "../../api/ekzat";
import { formatNumbers, getFirstItem } from "../../utils";
import { useSelector } from "react-redux";
// import { Loader } from "../loader/Loader";
import { getUserProfile } from "../../api/profile";
import { RiArrowDownSFill, RiArrowRightSFill } from "react-icons/ri";
import nigeria from "../../assets/nigria.png"
import { TbArrowsExchange2 } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowRoundBack } from 'react-icons/io';
import { Dropdown } from '../dropdown/Dropdown';

export const  BuySell = ({ isOpen,onClose,assets, transactionType, setTransactionType,}) => {

  const dispatch = useDispatch();

  const user = useSelector((state) => state.ekzaUser.user);
  const global = useSelector((state) => state);

  const [openList, setOpenList] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState(assets[0]);
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState("crypto");
  const [message, setMessage] = useState("");
  const [conversionResult, setConversionResult] = useState(null);
  const [step, setStep] = useState(1);
  
  const abortControllerRef = useRef(null);

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
  }, [amount, currency]);

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
        currency: currency.currency,
        amountType,
        transactionType,
        signal,
      });
      if (conversionData.success) {
        setConversionResult(conversionData);
        setIsLoading(false);
      } else {
        setConversionResult(null);
        setIsLoading(false);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
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
        currency: currency.currency,
        amountType,
      };
     
      if (transactionType === "buy") {
        await buyAsset(transactionData);
      } else if (transactionType === "sell") {
        await sellAsset(transactionData);
      }
      getUserProfile(dispatch);
      setStep(3);
    } catch (error) {
      setMessage(error.message || "An error occurred during the transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCryptoAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmountType("crypto")
    setAmount(newAmount);
    
    if (newAmount === "") {
      setConversionResult(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      debouncedHandleCalculate(newAmount);
    }
  };  

  const handleNairaAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmountType("fiat")
    setAmount(newAmount);
    
    if (newAmount === "") {
      setConversionResult(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      debouncedHandleCalculate(newAmount);
    }
  };  

  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

  return (
    <div>
        <div className={`fadded-container b-s-modal-overlay ${isOpen ? "open" : ""}`}>
      <div
        className={`b-s-modal-overlay md  ${isOpen ? "open" : ""}`}
        onClick={onClose}
      >
        {" "}
      </div>
      <div className="b-s-modal">
        {step === 2 && (<IoIosArrowRoundBack onClick={()=> setStep(1)} size={30} className='backmodal'/>)}
        <IoCloseSharp size={18} className="close-modal" onClick={onClose} />
        {isLoading && <Loader />}
        

        <div className="buysell-container" >
        {step === 1 && (<div className="toggle-buttons">
            <button
              className={`${transactionType === 'buy' ? 'active' : 'trans'}  buy-sell-btn`}
              onClick={() => setTransactionType('buy')}
            >
              Buy
            </button>
            <button
              className={`${transactionType === 'sell' ? 'active' : 'trans'} buy-sell-btn`}
              onClick={() => setTransactionType('sell')}
            >
              Sell
            </button>
          </div>)}
          {message && <p className='warning'>{message}</p>}
          {step === 1 && (<div className="buy-sell-parent-wrap" >
          <div className="spend-wrap">
            <h3>Fiat</h3>
            <div className="spend-component">
              <div className="spend-select-wrap">
                <img src={nigeria} alt="" />
                <span>NGN</span>
                <RiArrowRightSFill />
              </div>
              <input 
                type="number" 
                placeholder="Enter naira amount" 
                id="amount"
                value={amountType === "fiat" ? amount : getFirstItem(conversionResult?.convertedNairaAmount)}
                onChange={handleNairaAmountChange}
              />
            </div>

            <div className="fiat-bal-wrap">
              <span>NGN balance:</span> 
              <span>{user?.nairaBalance?.toFixed(3)} </span>
            </div>
          </div>

          <div className="rate-wrap">
            1 {currency.currency?.toUpperCase()} === {global.currency.selectedCurrency === "NGN" ? 
            currency.nairaValue : 
            currency.usdValue
            }
            </div>

          <div className="get-wrap">
            <h3>Crypto</h3>
            <div className="get-component">
              <div className="get-select-wrap" onClick={handleOpencoinList}>
              <img src={currency.image} alt="" />
                <span>{currency.currency}</span>
                <RiArrowDownSFill />
              </div>
            
              <input 
                type="number" 
                placeholder="Enter crypto amount"
                value={amountType === "crypto" ? amount : getFirstItem(conversionResult?.convertedCryptoAmount)}
                onChange={handleCryptoAmountChange}
              />
            </div>
            <div className="crypto-bal-wrap">
              <span>{currency.currency} balance:</span> 
              <span>{parseFloat(currency.balance).toFixed(3)}</span>
            </div>
          
            <Dropdown 
              user={user} 
              setCurrency={setCurrency} 
              handleOpencoinList={handleOpencoinList} 
              openList={openList}
            />

          </div>

          {transactionType === 'buy' && <div className="fees-review">
                <div className="fees-rap"> 
                  <span>Amount</span>  
                  {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                  <span>{conversionResult?.cryptoAmount} ({conversionResult?.convertedNairaAmount})</span>}
                </div>
                <div className="fees-rap"> 
                  <span>fee</span>  
                    {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                    <span>{conversionResult?.cryptoFee} ({conversionResult?.fiatFee})</span>}
                </div>
                <div className="fees-rap"> 
                  <span>You will get</span>  
                  {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                  <span>{conversionResult?.cryptoAmountAfterFee} ({conversionResult?.fiatAmountAfterFee})</span>}
                </div>
                <div className="fees-rap"> <span>Tradibg Bounce</span>  <span>0.000</span></div>
          </div>}

          {transactionType === 'sell' && <div className="fees-review">
                <div className="fees-rap"> 
                  <span>Amount</span>  
                  {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                  <span>{(conversionResult?.convertedNairaAmount)} ({conversionResult?.convertedCryptoAmount})</span>}
                </div>
                <div className="fees-rap"> 
                  <span>fee</span>  
                    {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                    <span>{(conversionResult?.fiatFee)} Naira ({conversionResult?.cryptoFee})</span>}
                </div>
                <div className="fees-rap"> 
                  <span>You will get</span>  
                  {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                  <span>{(conversionResult?.fiatAmountAfterFee)} ({conversionResult?.cryptoAmountAfterFee})</span>}
                </div>
                <div className="fees-rap"> <span>Tradibg Bounce</span>  <span>0.000</span></div>
          </div>}
          
          

          <div className="buy-sell-btn-wrap" >
          {/* <button className="buy-sell-btn" onClick={()=>{setNewStep(2)}}>Proceed</button> */}
          <button
            className="buy-sell-btn"
            onClick={()=>setStep(2)}
            disabled={isLoading || !amount || !conversionResult}
            style={{ cursor: isLoading || !amount || !conversionResult ? "not-allowed" : "pointer" }}
          >
           Proceed
          </button>
          </div>
          </div>)}
          {step === 2 &&(
            <div className="review-buy-sell">
              <div className="review-box-wrap">
                <div className="box-left">
                  <span>Converting</span>
                  <div className="review-coin-wrap">
                    <img src={nigeria} alt="" />
                    {/* <span>{conversionResult?.convertedNairaAmount}</span> */}
                    <span>{conversionResult?.convertedNairaAmount.split(' ')[0]}</span>

                  </div>
                  <span>{conversionResult?.convertedCryptoAmount}</span>
                </div>
                <div className="arrow-right-wrap">
                <svg width="159" height="7" viewBox="0 0 159 7" fill="none" class="absolute left-1/2 top-1/2 block translate-x-[-50%] translate-y-[-50%] light:hidden mobile:hidden"><path d="M1 3.5H151" stroke="url(#paint0_linear_622_17075)" stroke-width="1.5" stroke-linecap="square" stroke-dasharray="0.1 5"></path><path d="M155 6.5L159 3.5L155 0.5" fill="#FBFBFB"></path><defs><linearGradient id="paint0_linear_622_17075" x1="146.604" y1="4.74994" x2="0.249478" y2="6.49899" gradientUnits="userSpaceOnUse"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></linearGradient></defs></svg>
                <div className="exchange-iconwrap">
                <TbArrowsExchange2 size={24} className='exc-icon' />
                </div>
                </div>
                <div className="box-left">
                  <span>You get</span>
                  <div className="review-coin-wrap">
                    <img src={currency.image} alt="" />
                    <span>{conversionResult?.convertedCryptoAmount.split(' ')[0]}</span>
                  </div>
                  <span>{conversionResult?.convertedNairaAmount}</span>
                </div>
                
              </div>

              {/* This is should be on the first step */}
              {/* <div className="rate-wrap"> 1 USDC = 0.0237 HiVE</div> */}

              {/* <div className="fees-review">
                <div className="fees-rap"> <span>Amount</span>  <span>100 Hive</span></div>
                <div className="fees-rap"> <span>fee</span>  <span>2 Hive</span></div>
                <div className="fees-rap"> <span>You will get</span>  <span>98 Hive</span></div>
                <div className="fees-rap"> <span>Order Type</span>  <span>Buy</span></div>
                <div className="fees-rap"> <span>Trading Bounce</span>  <span>0.30</span></div>
              </div> */}

              {transactionType === 'buy' && <div className="fees-review">
                  <div className="fees-rap"> 
                    <span>Amount</span>  
                    {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                    <span>{conversionResult?.cryptoAmount} ({conversionResult?.convertedNairaAmount})</span>}
                  </div>
                  <div className="fees-rap"> 
                    <span>fee</span>  
                      {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                      <span>{conversionResult?.cryptoFee} ({conversionResult?.fiatFee})</span>}
                  </div>
                  <div className="fees-rap"> 
                    <span>You will get</span>  
                    {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                    <span>{conversionResult?.cryptoAmountAfterFee} ({conversionResult?.fiatAmountAfterFee})</span>}
                  </div>
                  <div className="fees-rap"> <span>Tradibg Bounce</span>  <span>0.000</span></div>
              </div>}

              {transactionType === 'sell' && <div className="fees-review">
                    <div className="fees-rap"> 
                      <span>Amount</span>  
                      {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                      <span>{(conversionResult?.convertedNairaAmount)} ({conversionResult?.convertedCryptoAmount})</span>}
                    </div>
                    <div className="fees-rap"> 
                      <span>fee</span>  
                        {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                        <span>{(conversionResult?.fiatFee)} Naira ({conversionResult?.cryptoFee})</span>}
                    </div>
                    <div className="fees-rap"> 
                      <span>You will get</span>  
                      {!conversionResult ? <span>{!amount ? "---" : "Calculating..."}</span> : 
                      <span>{(conversionResult?.fiatAmountAfterFee)} ({conversionResult?.cryptoAmountAfterFee})</span>}
                    </div>
                    <div className="fees-rap"> <span>Trading Bonus</span>  <span>0.000</span></div>
              </div>}


              <div className="buy-btn-wrap">
                {/* <button onClick={()=> setStep(1)} className='back'>Back</button> */}
                <button onClick={handleTransaction}>{transactionType === "buy" ? "Buy" : "Sell"}</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="succe">
              <h3>Transaction Successful</h3>
              <button onClick={onClose} className="btn">Close</button>
            </div>
          )}
        </div>
        
      </div>
    </div>

    </div>
  )
}

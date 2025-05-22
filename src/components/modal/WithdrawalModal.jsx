import React, { useState, useEffect } from 'react';
import { processHiveWithdrawal, requestToken, processCryptoWithdrawal, getTransactionFees } from '../../api/ekzat';
import { RiArrowDownSFill } from 'react-icons/ri';
import { Dropdown } from '../dropdown/Dropdown';
import './withdraw-modal.scss';
import Spinner from '../spinner/Spinner';

export const WithdrawalModal = ({ isOpen, onClose, assets, user }) => {
  const [memo, setMemo] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [currency, setCurrency] = useState(assets[0]?.currency || '');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [fee, setFee] = useState(0.000)
  const [disableBtn, setDisableBtn] = useState(false)
  const [spinner, setSpinner] = useState(false)
  const [disableBtn2, setDisableBtn2] =useState(false)

  
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [openList, setOpenList] = useState(false)
  const [displaySearch , setDisplaySearch] = useState(false)
  
  useEffect(() => {
    handleGetFees(selectedAsset?.currency)
  }, [selectedAsset])
  
  const handleGeneralWithdrawal = async (e) => {
    if(selectedAsset.currency === "hive" || (selectedAsset.currency === "hive_dollar" || selectedAsset.currency === "hbd")) {
      await handleHiveWithdrawal();
    } else {
      await handleCryptoWithdrawal();
    }
  }

  const handleHiveWithdrawal = async () => {
    setDisableBtn2(true)

    try {
      const withdrawalData = { to, amount, currency: selectedAsset.currency, memo, withdrawalToken };
      const result = await processHiveWithdrawal(withdrawalData);
      setMessage(result.message);
      setStep(3)
      setDisableBtn2(true)
    } catch (error) {
      console.log(error);
      setMessage(error.message);
      setDisableBtn2(false)
    }
  };

  const handleCryptoWithdrawal = async () => {
    try {
      const withdrawalData = { to, amount, currency: selectedAsset.currency };
      const result = await processCryptoWithdrawal(withdrawalData);
      setMessage(result.message);
      setStep(3)
    } catch (error) {
      console.log(error);
      setMessage(error.message);
    }
  };

  const getToken = async () => {
    setDisableBtn(true)
    setSpinner(true)
    
     // Validation logic
  if (!amount || !to) {
    setMessage("Both Address and Amount fields are required");
    setDisableBtn(false); 
    setSpinner(false); 
    return; 
  }
  setMessage("");

    try {
      const data = await requestToken();
      if(data?.success === true){
        setStep(2)
      }
    } catch (error) {
      console.log(error)
      setDisableBtn(false)
      setSpinner(false)
    }
  }


  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

  const handleGetFees = async () => {
    try {
        const result = await getTransactionFees(selectedAsset.currency, selectedAsset.depositAddress, selectedAsset.depositAddress);
        setFee(result.fee)
    } catch (error) {
        console.error('Error fetching transaction fees:', error);
    }
};

  return (
    <div className={`fadded-container modal-overlay ${isOpen ? 'open' : ''}`} >
    <div className={`modal-overlay  ${isOpen ? 'open' : ''}`}  onClick={onClose}> </div>
    {/* <div className={`modal-overlay ${isOpen ? 'open' : ''}`}> */}
      <div className="modal testing">
        <span className="close-modal" onClick={onClose}>X</span>
        <h2 className='w-header'>Send</h2>
        {message && <p className='warning'>{message}</p>}
        {step === 1 && <div className="w-input-group">

          <div className='w-main'>
            {/* <div className='w-coin-select-wrapper'>
              <div className="w-currency-select-wrap" onClick={handleOpencoinList}>
                <img className="w-deposit-coin-image" src={selectedAsset.image} alt="" />
                <span className='w-picker-currency'>{selectedAsset.currency}</span>
                <RiArrowDownSFill  size={24}/>
              </div>

              <Dropdown 
                user={user}
                setCurrency={setSelectedAsset} 
                handleOpencoinList={handleOpencoinList} 
                openList={openList}
              />
              
            </div> */}

            <div className='d-coin-select-wrapper'>
            <span>{selectedAsset?.currency}</span>
            <div className="d-currency-select-wrap" onClick={handleOpencoinList}>
              <img className="d-coin-wrap" src={selectedAsset?.image} alt="" />
              <span className='d-picker-currency'>{selectedAsset?.currency}</span>
              <RiArrowDownSFill  size={24}/>
              <Dropdown 
              user={user}
              setCurrency={setSelectedAsset} 
              handleOpencoinList={handleOpencoinList} 
              openList={openList}
              displaySearch={displaySearch} />

            </div>

          </div>
          </div>

          {selectedAsset.depositAddress ? <>
           <div className="w-input-group">
            <label htmlFor="recipient-account">Recipient Address:</label>
            <input
              className='w-input'
              type="text"
              placeholder="Recipient Address"
              value={to}

              ////convert to lowercase only if it is hive
              onChange={(e) => setTo(e.target.value)}
              id="recipient-account"
            />
           </div>


           <div className="w-A-input-group">
            <label htmlFor="withdraw-amount">Amount:</label>
            <div className="wrap-input">
            <input
              className='w-input'
              type="number"
              id="withdraw-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <div className="max-wrap">
               <span onClick={()=> setAmount(selectedAsset.balance)}>Max</span>
            </div>
            </div>
            
            <div className="wrap">
              <span>Available Balance: {selectedAsset.balance} </span>
             <span>Fee: {fee ? fee : (0.000)}({selectedAsset.symbol.toUpperCase()})</span>
            </div>
            </div>
            
            {selectedAsset?.memo && <>
              <label htmlFor="memo">Memo:</label>
              <input
                className='w-input'
                type="text"
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Enter memo"
              />
            </>}
            <button className="withdraw-btn" onClick={getToken} disabled={disableBtn}>{!spinner ? "Withdraw" : <Spinner /> }</button>
            </> : <div className="withdrawal-info-wrapper">
            <h3 className='warning'>{selectedAsset?.currency}({selectedAsset?.symbol?.toUpperCase()}) withdrawal is coming soon...</h3>
            <span className='withdrawal-address-info-el'>No address/network available for this asset yet</span>
          </div>}
        </div>}

        {step === 2 && <div className="w-input-group">
          <label htmlFor="withdrawalToken">Withdrawal token</label>
          <input
            className='w-input'
            type="text"
            id="withdrawalToken"
            value={withdrawalToken}
            onChange={(e) => setWithdrawalToken(e.target.value)}
            placeholder="Enter withdrawal token"
          />
          <div className="checktoken">Check email for Withdrawal token.</div>
          <button className="withdraw-btn" disabled={disableBtn2} onClick={handleGeneralWithdrawal}>{disableBtn2 ? <Spinner/> :"Withdraw"}</button>
        </div>}
        {step === 3 && <div className="">
         <h4>Withdrawal processed successfully</h4>
        </div>}
      </div>
    </div>
    // </div>
  );
};

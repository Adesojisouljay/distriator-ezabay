import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { requestToken, internalTransfer } from '../../api/ekzat';
import { RiArrowDownSFill } from 'react-icons/ri';
import { Dropdown } from '../dropdown/Dropdown';
import './withdraw-modal.scss';
import Spinner from '../spinner/Spinner';
import { getReceiverProfile, getUserProfile } from '../../api/profile';
import { Loader } from '../loader/Loader';

export const InternalTransferModal = ({ isOpen, onClose, assets, user }) => {
    const dispatch = useDispatch();

    console.log(assets)

  const [memo, setMemo] = useState('');
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [disableBtn, setDisableBtn] = useState(true)
  const [spinner, setSpinner] = useState(false)
  const [disableBtn2, setDisableBtn2] =useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const debounceTimeout = useRef(null); // Store timeout reference

  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [openList, setOpenList] = useState(false)
  const [displaySearch , setDisplaySearch] = useState(false);

  console.log(selectedAsset)

  useEffect(() => {
    if (!receiver) {
      setReceiverInfo(null);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      getReceiver();
    }, 1000);

    return () => clearTimeout(debounceTimeout.current);
  }, [receiver]);
  

  const getToken = async () => {
    setDisableBtn(false)
    
    if (!amount || !receiver || receiverInfo === null) {
        setMessage("Both Receiver and Amount fields are required");
        setDisableBtn(true); 
        return; 
    }

    setMessage("");

    try {
      console.log(disableBtn)
      const data = await requestToken();
      if(data?.success === true){
        setStep(2)
      }
    } catch (error) {
      console.log(error)
      setDisableBtn(true)
    }
  }

  const handleOpencoinList = () => {
    setOpenList(!openList);
  };

    const getReceiver = async () => {
        console.log(receiver)
        setLoading(true);
        try {
            const data = await getReceiverProfile(receiver);
            console.log(data === null)
            if(!data) {
                setDisableBtn(true)
                setReceiverInfo(null);
                return;
            }
            setReceiverInfo(data);
            setDisableBtn(false)
        } catch (error) {
            setDisableBtn(true)
            setReceiverInfo(null);
            toast.error(error.message, {
            style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
        });
        } finally {
            setLoading(false);
        };
    }

    const handleTransfer = async () => {
        console.log(selectedAsset?.currency, amount)
        try {
          const result = await internalTransfer({
            to: receiver,
            amount: Number(amount),
            currency: selectedAsset?.currency,
            memo,
            withdrawalToken,
          });

          toast.success(`${selectedAsset?.currency} transfer to ${receiver} successful`, {
            style: { backgroundColor: 'rgba(229, 229, 229, 0.1)', color: '#fff', fontSize: '16px', marginTop: "60px" },
          });
          onClose();
          getUserProfile(dispatch);

        } catch (error) {
          console.error('Transfer failed:', error.message);
          // Optionally show error to user
        }
      };
      
  return (
    <div className={`fadded-container modal-overlay ${isOpen ? 'open' : ''}`} >
    <div className={`modal-overlay  ${isOpen ? 'open' : ''}`}  onClick={onClose}> </div>
    {/* <div className={`modal-overlay ${isOpen ? 'open' : ''}`}> */}
      <div className="modal testing">
        <span className="close-modal" onClick={onClose}>X</span>
        <h2 className='w-header'>Internal Transfer</h2>
        {loading && <Loader />}
        {message && <p className='warning'>{message}</p>}
        {step === 1 && <div className="w-input-group">

          <div className='w-main'>
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
                displaySearch={displaySearch} 
              />
            </div>
          </div>
          </div>

         <>
           <div className="w-input-group">
            <label htmlFor="recipient-account">Recipient username/email:</label>
            <input
              className='w-input'
              type="text"
              placeholder="Recipient Address"
              value={receiver}

              ////convert to lowercase only if it is hive
              onChange={(e) => setReceiver(e.target.value)}
              id="recipient-account"
            />
           </div>

           {receiverInfo && (
              <div>
                <h4>Transferring to {receiverInfo?.firstName} {receiverInfo?.lastName}</h4>
              </div>
            )}

           <div className="w-A-input-group">
            <label htmlFor="withdraw-amount">Amount:</label>
            <div className="wrap-input">
            <input
              className='w-input'
              type="number"
              id="withdraw-amount"
              value={amount}
              onChange={(e) => {
                setDisableBtn(false)
                setAmount(e.target.value)
                if(!e.target.value) {
                  setDisableBtn(true)
                  return
                }
              }}              
              placeholder="Enter amount"
            />
            <div className="max-wrap">
               <span onClick={()=> setAmount(selectedAsset.balance)}>Max</span>
            </div>
            </div>
            
            <div className="wrap">
              <span>Available Balance: {selectedAsset?.balance} </span>
            </div>
            </div>
            
              <label htmlFor="memo">Memo/Note:</label>
              <input
                className='w-input'
                type="text"
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e?.target?.value)}
                placeholder="Enter memo"
              />
              
            <button className="withdraw-btn" onClick={getToken} disabled={disableBtn}>{!spinner ? "Proceed" : <Spinner /> }</button>
         </> 
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
          <button 
            className="withdraw-btn" 
            disabled={disableBtn2} 
            onClick={handleTransfer}
            >
            {disableBtn2 ? <Spinner/> :"Withdraw"}
          </button>
        </div>}
        {step === 3 && <div className="">
         <h4>Withdrawal processed successfully</h4>
        </div>}
      </div>
    </div>
    // </div>
  );
};

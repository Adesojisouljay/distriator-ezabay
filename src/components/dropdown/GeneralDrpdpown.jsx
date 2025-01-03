import React, { useState } from 'react'
import { RiArrowDownSFill, RiBankFill } from 'react-icons/ri';
import nigeria from "../../assets/nigria.png"
import Usa from "../../assets/Usa.webp"
import "./general.scss"

export const GeneralDropdown = (props) => {
    const { items, handleOpenList, setSelectedItem, itemName, openList, selectLabal } = props;
    console.log(itemName)
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = items?.filter(item =>
        (item.bankName || item.name|| item).toLowerCase().includes(searchQuery.toLowerCase()) 
    );

  return (
    <div className='gd-container'>
        <div className="gd-item-select-wrap" onClick={handleOpenList}>
            { itemName?.image ?
            <img className='gd-select-image' src={itemName?.image} alt="" /> :
            // we can use the selectLabel to decide which image to show here for country and bank account
            <RiBankFill size={24} />
            }
            <span className='gd-select-title'>{itemName?.name || `Select ${selectLabal}`}</span>
            <RiArrowDownSFill  size={24}/>
        </div>
        {(openList && items?.length > 6) && 
       <input 
            className={`dropdown-search-input ${"openlist"} `}
            type="text"
            placeholder={`Search ${selectLabal}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
         />}
        <div 
            className={`gd-item-list-wrap ${openList ? "gd-openlist": "gd-openclose"} ${items?.length <= 6 ? "gd-short-list" : ""}`}
            >
            {filteredItems?.map((item, index)=> (<div className={`gd-item-list`} key={index} >
                <div 
                    className="gd-item-picker"
                    onClick={() => {
                        setSelectedItem(item);
                        handleOpenList();
                    }}
                >
                    {item.image && <img className='gd-select-image' src={item.image} alt="" />}
                    <span style={{width: "200px"}} >{item.bankName || item.name|| item}</span>
                    <span>{item?.accountNumber || null}</span>
                </div>
            </div>))}
        </div>
    </div>
  )
}

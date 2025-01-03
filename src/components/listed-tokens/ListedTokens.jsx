import React, { useEffect, useState } from 'react';
import { fetchCryptoData } from '../../api/ekzat';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatNumberWithCommas } from '../../utils';
import './listed-tokens.scss';
import { MdKeyboardArrowRight } from 'react-icons/md';

export const ListedTokens = ( {searchQuery, setSearchQuery, openBuySellModal}) => {
    const global = useSelector((state) => state);
    
    const [cryptoData, setCryptoData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currency = global.currency.selectedCurrency

    useEffect(() => {
        getCryptoData();
    }, [currency]);

    useEffect(() => {
        filterCryptoData();
    }, [searchQuery, cryptoData]);

    const getCryptoData = async () => {
        try {
            const response = await fetchCryptoData();
            console.log(response)
    
            if (response?.data?.success) {
                const { usdData, ngnData, mxnData } = response.data.cryptoData;
                if (currency.country === "Usa") {
                    setCryptoData(usdData);
                } else if (currency.country === "Nigeria") {
                    setCryptoData(ngnData);
                } else if (currency.country === "Mexico") {
                    setCryptoData(mxnData);
                }
            } else {
                console.error('Failed to fetch data:', response?.data?.message);
                setError(response?.data?.message || 'Failed to fetch data.');
            }
        } catch (error) {
            console.error('Error fetching data from /crypto-data endpoint:', error);
            setError('An error occurred while fetching the data.');
        } finally {
            setLoading(false);
        }
    };

    const filterCryptoData = () => {
        const filtered = cryptoData?.filter(coin => 
            coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <div className="listed-tokens-container">
            <h2 className="listed-tokens-title">Market updates</h2>
            <div className="listed-token-grid">
                {loading && <p className="listed-tokens-loading">Loading...</p>}
                {error && <p className="listed-tokens-error">{error}</p>}
                {!loading && !error && filteredData?.map((coin) => {
                    const percentageChangeClass = coin.price_change_percentage_24h >= 0 
                        ? 'positive-change' 
                        : 'negative-change';

                    return (
                        <div key={coin.id} className="listed-token-container">
                            <div className="token-box">
                                <div className="token-content-wrap">
                                    <img src={coin.image} alt={coin.name} className="token-image" />
                                    <MdKeyboardArrowRight size={20} />
                                </div>
                                <div className="token-content-wrap">
                                <Link to={`/coin/${coin.id}`} className="token-name-link">
                                        {coin.name}
                                    </Link> <span className="token-price">{currency.sign}{formatNumberWithCommas(coin.current_price)}</span>
                                </div>
                                <div className={`token-content-wrap ${percentageChangeClass}`}>
                                    <span className="token-symbol">{coin?.symbol.toUpperCase()}</span>
                                    <span className="token-change">{coin?.price_change_percentage_24h?.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

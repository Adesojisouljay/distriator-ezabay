import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './trade.scss'; // Assuming you have a CSS file for styling

export const Trade = () => {
  const [coinData, setCoinData] = useState({});
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('1'); // Default to 1 day

  // Declare the coin IDs to be fetched
  const coinIds = "ids=bitcoin,hive,hive_dollar,tether,dogecoin,tron,toncoin,gala,solana,ethereum";

  // Mapping of coin IDs to user-friendly names
  const coins = {
    bitcoin: 'Bitcoin',
    hive: 'Hive',
    hive_dollar: 'Hive Backed Dollar',
    tether: 'Tether',
    dogecoin: 'Dogecoin',
    tron: 'TRON',
    toncoin: 'Toncoin',
    gala: 'Gala',
    solana: 'Solana',
    ethereum: 'Ethereum',
  };

  useEffect(() => {
    // Fetch market data for all coins
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?${coinIds}&vs_currencies=ngn&include_market_cap=true&include_24hr_change=true`
        );
        setCoinData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch historical price data based on the selected time range
    const fetchPriceHistory = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=ngn&days=${timeRange}`
        );
        setPriceHistory(response.data.prices);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchPriceHistory();
  }, [selectedCoin, timeRange]);

  const formatDataForChart = (priceHistory) => {
    return priceHistory.map((entry) => ({
      name: new Date(entry[0]).toLocaleDateString(), // Format date as desired
      uv: entry[1], // Price value
    }));
  };

  if (!coinData[selectedCoin]) return <div>Loading...</div>;

  const formattedChartData = formatDataForChart(priceHistory);
  const selectedCoinData = coinData[selectedCoin];
  const coinName = coins[selectedCoin];
  const formattedPrice = selectedCoinData.ngn.toLocaleString();

  return (
    <div className="bitcoin-page">
      <header className="header">
        <h1>{coinName}</h1>
        <div className="header-icon">
          <img src={`path_to_${selectedCoin}_icon`} alt={`${coinName} Icon`} />
        </div>
      </header>
      <section className="btc-market-value">
        <p>{coinName}'s Market Value</p>
        <h2>₦{formattedPrice}</h2>
        <div className="time-range-buttons">
          <button onClick={() => setTimeRange('1')}>1 Day</button>
          <button onClick={() => setTimeRange('7')}>7 Days</button>
          <button onClick={() => setTimeRange('30')}>1 Month</button>
          <button onClick={() => setTimeRange('90')}>3 Months</button>
          <button onClick={() => setTimeRange('180')}>6 Months</button>
        </div>
        <div className="btc-chart">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={formattedChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uv" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="btc-balance">
        <h3>Your {coinName} Balance</h3>
        <h2>0 {coinName}</h2>
      </section>
      <div className="actions">
        <button className="buy">Buy</button>
        <button className="sell">Sell</button>
      </div>
      <div className="coin-selector">
        <label>Select Coin: </label>
        <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)}>
          {Object.keys(coins).map((coin) => (
            <option key={coin} value={coin}>
              {coins[coin]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

import React from 'react';
import { HiUsers, HiArrowsRightLeft, HiBolt, HiGlobeAlt } from 'react-icons/hi2';

const StatsSection = () => {
  const stats = [
    { 
      number: "10,000+", 
      label: "Active Traders", 
      icon: <HiUsers size={24} className="stat-icon text-accent-green" />,
      sub: "Across 45+ Countries"
    },
    { 
      number: "$2.5M+", 
      label: "Volume Swapped", 
      icon: <HiArrowsRightLeft size={24} className="stat-icon text-accent-cyan" />,
      sub: "HIVE, HBD & Fiat"
    },
    { 
      number: "~3 Secs", 
      label: "Block Finality", 
      icon: <HiBolt size={24} className="stat-icon text-accent-green" />,
      sub: "Near Instant On-Chain"
    },
    { 
      number: "0% Fees", 
      label: "Hive Network Gas", 
      icon: <HiGlobeAlt size={24} className="stat-icon text-accent-cyan" />,
      sub: "Resource Credits Model"
    }
  ];

  return (
    <section className="modern-stats-section">
      <div className="container">
        <div className="stats-glass-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-glass-card scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="stat-icon-wrapper">
                {stat.icon}
              </div>
              <div className="stat-details">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-sub">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
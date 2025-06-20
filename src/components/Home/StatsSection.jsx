const StatsSection = () => {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item scroll-reveal">
            <div className="stat-number">200+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item scroll-reveal">
            <div className="stat-number">5k+</div>
            <div className="stat-label">Transaction</div>
          </div>
          <div className="stat-item scroll-reveal">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item scroll-reveal">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
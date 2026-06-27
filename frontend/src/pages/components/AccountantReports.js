import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const AccountantReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await feeService.getAll();
        const allFees = response.data;
        const pending = allFees.filter((fee) => !fee.isPaid);
        const paid = allFees.filter((fee) => fee.isPaid);

        setStats({
          totalFees: allFees.length,
          totalAmount: allFees.reduce((sum, fee) => sum + fee.amount, 0),
          pendingCount: pending.length,
          pendingAmount: pending.reduce((sum, fee) => sum + fee.amount, 0),
          paidCount: paid.length,
          paidAmount: paid.reduce((sum, fee) => sum + fee.amount, 0),
        });
      } catch (err) {
        setError('Failed to load fee reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>📊 Accountant Reports</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Fees</h3>
            <div className="value">{stats.totalFees}</div>
          </div>
          <div className="stat-card">
            <h3>Total Amount</h3>
            <div className="value">₹{stats.totalAmount}</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="value">{stats.pendingCount} / ₹{stats.pendingAmount}</div>
          </div>
          <div className="stat-card">
            <h3>Paid</h3>
            <div className="value">{stats.paidCount} / ₹{stats.paidAmount}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantReports;

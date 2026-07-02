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
        const allFees = Array.isArray(response?.data) ? response.data : [];
        const pending = allFees.filter((fee) => !fee.isPaid);
        const paid = allFees.filter((fee) => fee.isPaid);

        setStats({
          totalFees: allFees.length,
          totalAmount: allFees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
          pendingCount: pending.length,
          pendingAmount: pending.reduce((sum, fee) => sum + (fee.amount || 0), 0),
          paidCount: paid.length,
          paidAmount: paid.reduce((sum, fee) => sum + (fee.amount || 0), 0),
        });
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          setError('Failed to load fee reports');
        }
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
            <div className="value">{stats?.totalFees ?? 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Amount</h3>
            <div className="value">₹{stats?.totalAmount ?? 0}</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="value">{stats?.pendingCount ?? 0} / ₹{stats?.pendingAmount ?? 0}</div>
          </div>
          <div className="stat-card">
            <h3>Paid</h3>
            <div className="value">{stats?.paidCount ?? 0} / ₹{stats?.paidAmount ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantReports;

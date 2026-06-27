import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const AccountantPayments = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaidFees = async () => {
      try {
        setLoading(true);
        const response = await feeService.getAll();
        setFees(response.data.filter((fee) => fee.isPaid));
      } catch (err) {
        setError('Failed to load payment records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidFees();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>💳 Payment History</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Paid Date</th>
                <th>Method</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan="5">No payment records available.</td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id}>
                    <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                    <td>₹{fee.amount}</td>
                    <td>{fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}</td>
                    <td>{fee.paymentMethod || '-'}</td>
                    <td>{fee.transactionId || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountantPayments;

import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const ParentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeService.getAll();
      setFees(response.data);
    } catch (err) {
      setError('Failed to fetch fees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async (feeId) => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }
    try {
      await feeService.pay({
        feeId,
        paymentMethod: selectedPaymentMethod,
        transactionId: `TXN${Date.now()}`,
      });
      setSelectedPaymentMethod('');
      fetchFees();
      alert('Payment processed successfully!');
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  const calculateTotalPending = () => {
    return fees.filter(f => !f.isPaid).reduce((sum, f) => sum + f.amount, 0);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💰 Student Fees</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Pending Amount</h3>
          <div className="value">₹{calculateTotalPending()}</div>
        </div>
        <div className="stat-card">
          <h3>Paid Fees</h3>
          <div className="value">{fees.filter(f => f.isPaid).length}</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee._id}>
                  <td><strong>{fee.student?.firstName} {fee.student?.lastName}</strong></td>
                  <td>₹{fee.amount}</td>
                  <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      backgroundColor: fee.isPaid ? '#d1fae5' : '#fee2e2',
                      color: fee.isPaid ? '#065f46' : '#991b1b',
                    }}>
                      {fee.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>{fee.paymentMethod || '-'}</td>
                  <td>
                    {!fee.isPaid && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <select
                          value={selectedPaymentMethod}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ddd' }}
                        >
                          <option value="">Select Method</option>
                          <option value="PhonePe">PhonePe</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Cash">Cash</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                        <button
                          className="btn btn-small"
                          onClick={() => handlePayFee(fee._id)}
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          Pay
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentFees;

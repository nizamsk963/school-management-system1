import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const AccountantPendingFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    const fetchPendingFees = async () => {
      try {
        setLoading(true);
        const response = await feeService.getPending();
        setFees(response.data);
      } catch (err) {
        setError('Failed to load pending fees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFees();
  }, []);

  const handlePayFee = async (feeId) => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      await feeService.pay({ feeId, paymentMethod: selectedPaymentMethod, transactionId: `TXN${Date.now()}` });
      setSelectedPaymentMethod('');
      const response = await feeService.getPending();
      setFees(response.data);
      alert('Payment processed successfully');
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>⏳ Pending Fees</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="5">No pending fees found.</td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee._id}>
                      <td>{fee.student?.firstName} {fee.student?.lastName}</td>
                      <td>₹{fee.amount}</td>
                      <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td>{fee.remarks || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px' }}
                          >
                            <option value="">Payment method</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                          <button className="btn btn-small" onClick={() => handlePayFee(fee._id)}>
                            Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountantPendingFees;

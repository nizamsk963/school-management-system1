import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/api';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    description: 'Annual Tuition Fees',
    dueDate: '',
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      await feeService.add(formData);
      setFormData({
        student: '',
        amount: '',
        description: 'Annual Tuition Fees',
        dueDate: '',
      });
      setShowForm(false);
      fetchFees();
    } catch (err) {
      setError('Failed to add fee');
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
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>💰 Fee Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Fee'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Fee</h3>
          <form onSubmit={handleAddFee}>
            <div className="form-row">
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Add Fee</button>
          </form>
        </div>
      )}

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
                  <td>{fee.student?.firstName} {fee.student?.lastName}</td>
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
                      <div className="payment-methods" style={{ gap: '5px', marginBottom: '10px' }}>
                        <button
                          className="btn btn-small"
                          onClick={() => handlePayFee(fee._id)}
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          Pay Now
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

export default FeeManagement;

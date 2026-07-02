import React, { useState, useEffect } from 'react';
import { feeService, classService, studentService } from '../../services/api';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    description: 'Annual Tuition Fees',
    dueDate: '',
  });

  useEffect(() => {
    fetchFees();
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!classes.length) return;
    if (!selectedGrade) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudent('');
      return;
    }

    const gradeClasses = classes.filter((cls) => String(cls.grade) === String(selectedGrade));
    const sections = [...new Set(gradeClasses.map((cls) => cls.section).filter(Boolean))].sort();
    if (!sections.length) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudent('');
      return;
    }

    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection('');
      setSelectedClassId('');
      setSelectedStudent('');
      return;
    }

    const matchedClass = gradeClasses.find((cls) => String(cls.section) === String(selectedSection));
    setSelectedClassId(matchedClass?._id || '');
    setSelectedStudent('');
  }, [classes, selectedGrade, selectedSection]);

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

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetFeeForm = () => {
    setFormData({
      student: '',
      amount: '',
      description: 'Annual Tuition Fees',
      dueDate: '',
    });
    setSelectedStudent('');
    setEditingFeeId(null);
    setShowForm(false);
    setError('');
  };

  const handleEditFee = (fee) => {
    setEditingFeeId(fee._id);
    setSelectedStudent(fee.student?._id || fee.student || '');
    setFormData({
      student: fee.student?._id || fee.student || '',
      amount: fee.amount || '',
      description: fee.description || 'Annual Tuition Fees',
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student for the fee record.');
      return;
    }

    try {
      const payload = {
        ...formData,
        student: selectedStudent,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
      };

      if (editingFeeId) {
        await feeService.update(editingFeeId, payload);
      } else {
        await feeService.add(payload);
      }

      resetFeeForm();
      fetchFees();
    } catch (err) {
      setError(editingFeeId ? 'Failed to update fee' : 'Failed to add fee');
    }
  };

  const handleDeleteFee = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await feeService.delete(id);
        fetchFees();
      } catch (err) {
        setError('Failed to delete fee');
      }
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

  const gradeOptions = [...new Set(classes.map((cls) => String(cls.grade)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  const visibleClasses = selectedGrade ? classes.filter((cls) => String(cls.grade) === String(selectedGrade)) : [];
  const sectionsForGrade = [...new Set(visibleClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const sectionStudents = selectedClassId
    ? students.filter((student) => {
      const studentClassId = student.class?._id || student.class || student.classId;
      return String(studentClassId) === String(selectedClassId);
    })
    : [];
  const visibleFees = selectedClassId
    ? sectionStudents.map((student) => {
      const studentUserId = student.userId?._id || student.userId;
      const fee = fees.find((feeRecord) => String(feeRecord.student?._id || feeRecord.student) === String(studentUserId));
      return {
        ...student,
        fee,
      };
    })
    : [];

  return (
    <div className="card">
      <div className="card-header">
        <h2>💰 Fee Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: '20px' }}>
        <h3>Navigate by Grade and Section</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection('');
                setSelectedClassId('');
                setSelectedStudent('');
              }}
            >
              <option value="">Select grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedGrade || !sectionsForGrade.length}
            >
              <option value="">Select section</option>
              {sectionsForGrade.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedGrade && !selectedSection && (
          <div className="alert alert-success" style={{ marginTop: '10px' }}>Select a section to view students and fee details for Grade {selectedGrade}.</div>
        )}
      </div>

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Fee</h3>
          <form onSubmit={handleAddFee}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedClassId}
                  required
                >
                  <option value="">Select student</option>
                  {sectionStudents.map((student) => {
                    const studentUserId = student.userId?._id || student.userId;
                    return (
                      <option key={student._id} value={studentUserId}>
                        {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                      </option>
                    );
                  })}
                </select>
              </div>
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

            <button type="submit" className="btn btn-success">{editingFeeId ? 'Update Fee' : 'Add Fee'}</button>
            {editingFeeId && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetFeeForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          {selectedGrade && selectedSection && (
            <>
              <div className="form-row" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: '1 1 260px' }}>
                  <label>Payment Method</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  >
                    <option value="">Select payment method</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No.</th>
                      <th>Class</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Payment Method</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFees.map((row) => {
                      const feeStatus = row.fee ? (row.fee.isPaid ? 'Paid' : 'Pending') : 'Pending';
                      return (
                        <tr key={row._id}>
                          <td>{row.userId?.firstName} {row.userId?.lastName}</td>
                          <td>{row.rollNumber || '-'}</td>
                          <td>{row.class ? `Grade ${row.class.grade} - Section ${row.class.section}` : 'N/A'}</td>
                          <td>₹{row.fee?.amount || 'N/A'}</td>
                          <td>{row.fee?.dueDate ? new Date(row.fee.dueDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <span style={{
                              padding: '5px 10px',
                              borderRadius: '3px',
                              backgroundColor: feeStatus === 'Paid' ? '#d1fae5' : '#fee2e2',
                              color: feeStatus === 'Paid' ? '#065f46' : '#991b1b',
                            }}>
                              {feeStatus}
                            </span>
                          </td>
                          <td>{row.fee?.paymentMethod || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              {row.fee && !row.fee.isPaid && (
                                <button
                                  className="btn btn-small"
                                  onClick={() => handlePayFee(row.fee._id)}
                                  style={{ background: '#10b981', color: 'white' }}
                                >
                                  Pay Now
                                </button>
                              )}
                              <button className="btn btn-secondary btn-small" onClick={() => row.fee && handleEditFee(row.fee)}>
                                Edit
                              </button>
                              <button className="btn btn-danger btn-small" onClick={() => row.fee && handleDeleteFee(row.fee._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : '➕ Add Fee'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeManagement;

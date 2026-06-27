import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';

const ParentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getAll();
      setAttendance(response.data);
    } catch (err) {
      setError('Failed to fetch attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ Child's Attendance</h2>
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
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td><strong>{record.student?.firstName} {record.student?.lastName}</strong></td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      backgroundColor: record.status === 'Present' ? '#d1fae5' : '#fee2e2',
                      color: record.status === 'Present' ? '#065f46' : '#991b1b',
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentAttendance;

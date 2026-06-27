import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';

const StudentAttendance = ({ userId }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    const loadAttendance = async () => {
      try {
        setLoading(true);
        const response = await attendanceService.getByStudent(userId);
        setAttendance(response.data);
      } catch (err) {
        setError('Failed to fetch attendance');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [userId]);

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((record) => record.status === 'Present').length;
    return ((present / attendance.length) * 100).toFixed(2);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ My Attendance</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Attendance %</h3>
          <div className="value">{calculateAttendancePercentage()}%</div>
        </div>
        <div className="stat-card">
          <h3>Total Days</h3>
          <div className="value">{attendance.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        backgroundColor: record.status === 'Present' ? '#d1fae5' : '#fee2e2',
                        color: record.status === 'Present' ? '#065f46' : '#991b1b',
                      }}
                    >
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

export default StudentAttendance;

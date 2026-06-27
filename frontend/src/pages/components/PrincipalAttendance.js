import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';

const PrincipalAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await attendanceService.getAll();
        setAttendance(response.data);
      } catch (err) {
        setError('Failed to load attendance records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const calculateSummary = () => {
    const total = attendance.length;
    const present = attendance.filter((item) => item.status === 'Present').length;
    const absent = attendance.filter((item) => item.status === 'Absent').length;
    return {
      total,
      present,
      absent,
      percentage: total ? ((present / total) * 100).toFixed(1) : '0.0',
    };
  };

  const summary = calculateSummary();

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ Attendance Overview</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Records</h3>
          <div className="value">{summary.total}</div>
        </div>
        <div className="stat-card">
          <h3>Present</h3>
          <div className="value">{summary.present}</div>
        </div>
        <div className="stat-card">
          <h3>Absent</h3>
          <div className="value">{summary.absent}</div>
        </div>
        <div className="stat-card">
          <h3>Attendance %</h3>
          <div className="value">{summary.percentage}%</div>
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
                <th>Student</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="4">No attendance records available.</td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.student?.firstName} {record.student?.lastName}</td>
                    <td>{record.class ? `Grade ${record.class.grade}` : 'N/A'}</td>
                    <td>{record.status}</td>
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

export default PrincipalAttendance;

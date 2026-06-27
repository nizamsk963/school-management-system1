import React, { useState, useEffect } from 'react';
import { studentService, teacherService, feeService } from '../../services/api';

const PrincipalReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [students, teachers, fees] = await Promise.all([
          studentService.getAll(),
          teacherService.getAll(),
          feeService.getAll(),
        ]);

        const pendingFees = fees.data.filter((fee) => !fee.isPaid);
        const paidFees = fees.data.filter((fee) => fee.isPaid);

        setStats({
          totalStudents: students.data.length,
          totalTeachers: teachers.data.length,
          totalFees: fees.data.length,
          pendingAmount: pendingFees.reduce((sum, fee) => sum + fee.amount, 0),
          paidAmount: paidFees.reduce((sum, fee) => sum + fee.amount, 0),
        });
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>📊 Principal Reports</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Students</h3>
            <div className="value">{stats.totalStudents}</div>
          </div>
          <div className="stat-card">
            <h3>Teachers</h3>
            <div className="value">{stats.totalTeachers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Fees</h3>
            <div className="value">{stats.totalFees}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Fees</h3>
            <div className="value">₹{stats.pendingAmount}</div>
          </div>
          <div className="stat-card">
            <h3>Collected</h3>
            <div className="value">₹{stats.paidAmount}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalReports;

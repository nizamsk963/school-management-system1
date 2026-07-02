import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService, feeService, teacherService } from '../../services/api';
import StudentManagement from '../components/StudentManagement';
import AccountantTeachers from '../components/AccountantTeachers';
import FeeManagement from '../components/FeeManagement';
import DashboardHome from '../components/DashboardHome';
import AccountantPendingFees from '../components/AccountantPendingFees';
import AccountantPayments from '../components/AccountantPayments';
import AccountantReports from '../components/AccountantReports';

const AccountantDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [students, fees, teachers] = await Promise.all([
        studentService.getAll(),
        feeService.getPending(),
        teacherService.getAll(),
      ]);
      setStats({
        totalStudents: students.data.length,
        totalTeachers: teachers.data.length,
        pendingFees: fees.data.length,
        totalAmount: fees.data.reduce((sum, fee) => sum + fee.amount, 0),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>💼 Accountant</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>
          <li><Link to="/dashboard/teachers">👨‍🏫 Teachers</Link></li>
          <li><Link to="/dashboard/fees">💰 Fee Collection</Link></li>
          <li><Link to="/dashboard/pending">⏳ Pending Fees</Link></li>
          <li><Link to="/dashboard/payments">💳 Payments</Link></li>
          <li><Link to="/dashboard/reports">📊 Reports</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Accountant & Admin Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<AccountantTeachers />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="pending" element={<AccountantPendingFees />} />
          <Route path="payments" element={<AccountantPayments />} />
          <Route path="reports" element={<AccountantReports />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountantDashboard;

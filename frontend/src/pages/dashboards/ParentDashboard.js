import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { feeService } from '../../services/api';
import ParentMarks from '../components/ParentMarks';
import ParentAttendance from '../components/ParentAttendance';
import ParentFees from '../components/ParentFees';
import ParentHomework from '../components/ParentHomework';
import DashboardHome from '../components/DashboardHome';
import ExamList from '../components/ExamList';
import RemarkList from '../components/RemarkList';

const ParentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fees = await feeService.getAll();
      setStats({
        totalFees: fees.data.length,
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
          <h2>👨‍👩‍👧 Parent</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/marks">📝 Student Marks</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/fees">💰 Fees</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          <li><Link to="/dashboard/remarks">💬 Remarks</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Parent Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="marks" element={<ParentMarks />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="fees" element={<ParentFees />} />
          <Route path="homework" element={<ParentHomework />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="remarks" element={<RemarkList />} />
        </Routes>
      </div>
    </div>
  );
};

export default ParentDashboard;

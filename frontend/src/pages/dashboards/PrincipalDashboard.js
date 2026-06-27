import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService, teacherService } from '../../services/api';
import StudentManagement from '../components/StudentManagement';
import TeacherManagement from '../components/TeacherManagement';
import FeeManagement from '../components/FeeManagement';
import DashboardHome from '../components/DashboardHome';
import PrincipalAttendance from '../components/PrincipalAttendance';
import PrincipalPerformance from '../components/PrincipalPerformance';
import PrincipalReports from '../components/PrincipalReports';

const PrincipalDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [students, teachers] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
      ]);
      setStats({
        totalStudents: students.data.length,
        totalTeachers: teachers.data.length,
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
          <h2>👔 Principal</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>
          <li><Link to="/dashboard/teachers">👨‍🏫 Teachers</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/performance">📈 Performance</Link></li>
          <li><Link to="/dashboard/fees">💰 Fees</Link></li>
          <li><Link to="/dashboard/reports">📊 Reports</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Principal Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="attendance" element={<PrincipalAttendance />} />
          <Route path="performance" element={<PrincipalPerformance />} />
          <Route path="reports" element={<PrincipalReports />} />
        </Routes>
      </div>
    </div>
  );
};

export default PrincipalDashboard;

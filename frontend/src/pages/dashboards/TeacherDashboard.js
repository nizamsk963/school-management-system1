import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import MarksManagement from '../components/MarksManagement';
import AttendanceManagement from '../components/AttendanceManagement';
import HomeworkManagement from '../components/HomeworkManagement';
import DashboardHome from '../components/DashboardHome';
import ExamList from '../components/ExamList';
import RemarkList from '../components/RemarkList';
import TeacherClasses from '../components/TeacherClasses';

const TeacherDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const students = await studentService.getAll();
      setStats({
        totalStudents: students.data.length,
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
          <h2>👨‍🏫 Teacher</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/marks">📝 Marks</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          <li><Link to="/dashboard/remarks">💬 Remarks</Link></li>
          <li><Link to="/dashboard/classes">📚 My Classes</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Teacher Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="marks" element={<MarksManagement teacherUserId={user?.id || user?.userId} />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="homework" element={<HomeworkManagement />} />
          <Route path="exams" element={<ExamList teacherUserId={user?.id || user?.userId} />} />
          <Route path="remarks" element={<RemarkList teacherUserId={user?.id || user?.userId} />} />
          <Route path="classes" element={<TeacherClasses teacherId={user?.id || user?.userId} />} />
        </Routes>
      </div>
    </div>
  );
};

export default TeacherDashboard;

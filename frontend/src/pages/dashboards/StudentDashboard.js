import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { marksService, attendanceService, homeworkService } from '../../services/api';
import StudentMarks from '../components/StudentMarks';
import StudentAttendance from '../components/StudentAttendance';
import StudentHomework from '../components/StudentHomework';
import DashboardHome from '../components/DashboardHome';
import EventList from '../components/EventList';
import ExamList from '../components/ExamList';
import RemarkList from '../components/RemarkList';

const StudentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const studentId = user?.id || user?.userId;

  useEffect(() => {
    const loadData = async () => {
      const resolvedStudentId = studentId;

      if (!resolvedStudentId) {
        setStats(null);
        return;
      }

      try {
        const [marks, attendance, homework] = await Promise.all([
          marksService.getByStudent(resolvedStudentId),
          attendanceService.getByStudent(resolvedStudentId),
          homeworkService.getAll(),
        ]);
        setStats({
          totalMarks: marks.data.length,
          attendanceRecords: attendance.data.length,
          homeworkAssignments: homework.data.length,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    loadData();
  }, [studentId]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍🎓 Student</h2>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        <ul className="nav-menu">
          <li><Link to="/dashboard" className="active">📊 Dashboard</Link></li>
          <li><Link to="/dashboard/marks">📝 Marks</Link></li>
          <li><Link to="/dashboard/attendance">✅ Attendance</Link></li>
          <li><Link to="/dashboard/homework">📖 Homework</Link></li>
          <li><Link to="/dashboard/exams">📋 Exams</Link></li>
          <li><Link to="/dashboard/events">🎉 Events</Link></li>
          <li><Link to="/dashboard/remarks">💬 Remarks</Link></li>
          <li style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="logout-btn" style={{ width: '100%' }}>🚪 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Student Dashboard</h1>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        <Routes>
          <Route index element={<DashboardHome stats={stats} />} />
          <Route path="marks" element={<StudentMarks userId={studentId} />} />
          <Route path="attendance" element={<StudentAttendance userId={studentId} />} />
          <Route path="homework" element={<StudentHomework />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="events" element={<EventList />} />
          <Route path="remarks" element={<RemarkList />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;

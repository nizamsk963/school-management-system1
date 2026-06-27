import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

import Login from './pages/Login';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import PrincipalDashboard from './pages/dashboards/PrincipalDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';
import AccountantDashboard from './pages/dashboards/AccountantDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {user ? (
          <>
            {user.role === 'super_admin' && (
              <Route path="/dashboard/*" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
            )}
            {user.role === 'principal' && (
              <Route path="/dashboard/*" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
            )}
            {user.role === 'teacher' && (
              <Route path="/dashboard/*" element={<TeacherDashboard user={user} onLogout={handleLogout} />} />
            )}
            {user.role === 'student' && (
              <Route path="/dashboard/*" element={<StudentDashboard user={user} onLogout={handleLogout} />} />
            )}
            {user.role === 'parent' && (
              <Route path="/dashboard/*" element={<ParentDashboard user={user} onLogout={handleLogout} />} />
            )}
            {user.role === 'accountant_admin' && (
              <Route path="/dashboard/*" element={<AccountantDashboard user={user} onLogout={handleLogout} />} />
            )}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <Route path="/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;

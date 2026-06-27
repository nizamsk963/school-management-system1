import React from 'react';

const DashboardHome = ({ stats }) => {
  const cards = [];

  const addCard = (label, value, formatter = (item) => item) => {
    cards.push({ label, value: formatter(value) });
  };

  if (stats?.totalStudents !== undefined) {
    addCard('Total Students', stats.totalStudents);
  }
  if (stats?.totalTeachers !== undefined) {
    addCard('Total Teachers', stats.totalTeachers);
  }
  if (stats?.totalClasses !== undefined) {
    addCard('Total Classes', stats.totalClasses);
  }
  if (stats?.totalParents !== undefined) {
    addCard('Total Parents', stats.totalParents);
  }
  if (stats?.totalMarks !== undefined) {
    addCard('Total Marks', stats.totalMarks);
  }
  if (stats?.attendanceRecords !== undefined) {
    addCard('Attendance Records', stats.attendanceRecords);
  }
  if (stats?.homeworkAssignments !== undefined) {
    addCard('Homework Assignments', stats.homeworkAssignments);
  }
  if (stats?.totalExams !== undefined) {
    addCard('Total Exams', stats.totalExams);
  }
  if (stats?.pendingFees !== undefined || stats?.pendingCount !== undefined || stats?.totalAmount !== undefined || stats?.totalFees !== undefined) {
    const feeValue = stats?.pendingFees ?? stats?.pendingCount ?? stats?.totalAmount ?? stats?.totalFees ?? 0;
    addCard('Pending Fees', feeValue, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }
  if (stats?.totalFees !== undefined && stats?.pendingFees === undefined && stats?.pendingCount === undefined && stats?.totalAmount === undefined) {
    addCard('Total Fees', stats.totalFees, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }

  if (cards.length === 0) {
    addCard('Total Students', 0);
    addCard('Total Teachers', 0);
    addCard('Total Classes', 0);
    addCard('Pending Fees', 0, (value) => `₹${Number(value || 0).toLocaleString()}`);
  }

  return (
    <div>
      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <h3>{card.label}</h3>
            <div className="value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📊 Quick Overview</h2>
        </div>
        <p>Welcome to the School Management System. Use the navigation menu to access different modules.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>🎯 Features</h2>
        </div>
        <ul style={{ lineHeight: '2', paddingLeft: '20px' }}>
          <li>✅ Student Management - Add, edit, delete and view student records</li>
          <li>✅ Teacher Management - Manage teacher information and assignments</li>
          <li>✅ Marks Management - Track student academic performance</li>
          <li>✅ Attendance Tracking - Monitor student attendance</li>
          <li>✅ Homework Assignment - Assign and track homework</li>
          <li>✅ Fee Management - Manage student fees and payments</li>
          <li>✅ Real-time Synchronization - Data updates across all dashboards</li>
          <li>✅ Role-based Access Control - Secure access for different user roles</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;

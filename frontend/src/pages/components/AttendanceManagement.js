import React, { useState, useEffect } from 'react';
import { attendanceService, studentService, classService } from '../../services/api';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    class: '',
    date: '',
    status: 'Present',
    remarks: '',
  });

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getAll();
      setAttendance(response.data);
    } catch (err) {
      setError('Failed to fetch attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.mark(formData);
      setFormData({
        student: '',
        class: '',
        date: '',
        status: 'Present',
        remarks: '',
      });
      setShowForm(false);
      fetchAttendance();
    } catch (err) {
      setError('Failed to mark attendance');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>✅ Attendance Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Mark Attendance'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Mark Attendance</h3>
          <form onSubmit={handleMarkAttendance}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select name="student" value={formData.student} onChange={handleInputChange} required>
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student.userId?._id || student.userId}>
                      {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Class</label>
                <select name="class" value={formData.class} onChange={handleInputChange} required>
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      Grade {cls.grade} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} required>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Half-day">Half-day</option>
                </select>
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="textarea"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Mark Attendance</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.student?.firstName} {record.student?.lastName}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      backgroundColor: record.status === 'Present' ? '#d1fae5' : '#fee2e2',
                      color: record.status === 'Present' ? '#065f46' : '#991b1b',
                    }}>
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

export default AttendanceManagement;

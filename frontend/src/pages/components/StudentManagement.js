import React, { useState, useEffect } from 'react';
import { studentService, classService } from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userId: '',
    password: '',
    rollNumber: '',
    classId: '',
    parentId: '',
    dateOfBirth: '',
    phone: '',
    gender: 'Male',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      userId: '',
      password: '',
      rollNumber: '',
      classId: '',
      parentId: '',
      dateOfBirth: '',
      phone: '',
      gender: 'Male',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser || !['super_admin', 'principal'].includes(currentUser.role)) {
        setError('You do not have permission to save a student.');
        return;
      }
      setError('');

      if (editingId) {
        await studentService.update(editingId, formData);
      } else {
        await studentService.add(formData);
      }

      resetForm();
      fetchStudents();
    } catch (err) {
      const message = err.response?.data?.message || 'Unknown error';
      setError(`Failed to save student: ${message}`);
      console.error(err);
    }
  };

  const handleEditStudent = (student) => {
    setEditingId(student._id);
    setFormData({
      firstName: student.userId?.firstName || '',
      lastName: student.userId?.lastName || '',
      userId: student.userId?.userId || '',
      password: '',
      rollNumber: student.rollNumber || '',
      classId: student.class?._id || '',
      parentId: student.parentId?._id || '',
      dateOfBirth: student.userId?.dateOfBirth ? new Date(student.userId.dateOfBirth).toISOString().slice(0, 10) : '',
      phone: student.userId?.phone || '',
      gender: student.userId?.gender || 'Male',
    });
    setShowForm(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>👨‍🎓 Student Management</h2>
        {currentUser && ['super_admin', 'principal'].includes(currentUser.role) && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '➕ Add Student'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={handleSubmitStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required={!editingId}
                  readOnly={!!editingId}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                  placeholder={editingId ? 'Leave blank to keep current password' : ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {`Grade ${cls.grade} ${cls.section}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">{editingId ? 'Update Student' : 'Save Student'}</button>
            {editingId && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={resetForm}>
                Cancel
              </button>
            )}
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
                <th>First Name</th>
                <th>Last Name</th>
                <th>User ID</th>
                <th>Roll Number</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.userId?.firstName}</td>
                  <td>{student.userId?.lastName}</td>
                  <td>{student.userId?.userId}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.userId?.phone}</td>
                  <td>
                    <div className="action-buttons">
                      {currentUser && ['super_admin', 'principal'].includes(currentUser.role) && (
                        <>
                          <button className="btn btn-secondary btn-small" onClick={() => handleEditStudent(student)}>Edit</button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeleteStudent(student._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;

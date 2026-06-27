import React, { useState, useEffect } from 'react';
import { teacherService, classService } from '../../services/api';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userId: '',
    password: '',
    subject: '',
    email: '',
    phone: '',
    gender: 'Male',
    qualifications: '',
    experience: 0,
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      setTeachers(response.data);
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await classService.getSubjects();
      setSubjects(response.data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
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
      subject: '',
      email: '',
      phone: '',
      gender: 'Male',
      qualifications: '',
      experience: 0,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingId(teacher._id);
    setFormData({
      firstName: teacher.userId?.firstName || '',
      lastName: teacher.userId?.lastName || '',
      userId: teacher.userId?.userId || '',
      password: '',
      subject: teacher.subject?._id || '',
      email: teacher.userId?.email || '',
      phone: teacher.userId?.phone || '',
      gender: teacher.userId?.gender || 'Male',
      qualifications: teacher.qualifications || '',
      experience: teacher.experience || 0,
    });
    setShowForm(true);
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await teacherService.update(editingId, formData);
      } else {
        await teacherService.add(formData);
      }
      resetForm();
      fetchTeachers();
    } catch (err) {
      setError('Failed to save teacher: ' + (err.response?.data?.message || 'Unknown error'));
      console.error('Teacher save error:', err);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.delete(id);
        fetchTeachers();
      } catch (err) {
        setError('Failed to delete teacher');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>👨‍🏫 Teacher Management</h2>
        <button className="btn btn-primary" onClick={toggleForm}>
          {showForm ? 'Cancel' : '➕ Add Teacher'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <form onSubmit={handleSubmitTeacher}>
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
                <label>User ID (optional)</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
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

            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-success">{editingId ? 'Update Teacher' : 'Save Teacher'}</button>
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
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.userId?.firstName}</td>
                  <td>{teacher.userId?.lastName}</td>
                  <td>{teacher.userId?.userId}</td>
                  <td>{teacher.userId?.email}</td>
                  <td>{teacher.userId?.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-small" onClick={() => handleEditTeacher(teacher)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteTeacher(teacher._id)}
                      >
                        Delete
                      </button>
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

export default TeacherManagement;

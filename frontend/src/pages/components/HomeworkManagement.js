import React, { useState, useEffect } from 'react';
import { homeworkService, classService } from '../../services/api';

const HomeworkManagement = () => {
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    dueDate: '',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchHomework();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const response = await homeworkService.getAll();
      setHomework(response.data);
    } catch (err) {
      setError('Failed to fetch homework');
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
      console.error('Failed to fetch classes:', err);
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

  const handleAddHomework = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      setError('Could not determine current user. Please log in again.');
      return;
    }

    try {
      const data = {
        ...formData,
        teacher: currentUser.id,
      };
      await homeworkService.add(data);
      setFormData({
        title: '',
        description: '',
        class: '',
        subject: '',
        dueDate: '',
      });
      setShowForm(false);
      fetchHomework();
      setError('');
    } catch (err) {
      setError('Failed to add homework: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📖 Homework Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Assign Homework'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Assign New Homework</h3>
          <form onSubmit={handleAddHomework}>
            <div className="form-row full">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      Grade {cls.grade} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
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

            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Assign Homework</button>
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
                <th>Title</th>
                <th>Description</th>
                <th>Assigned Date</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {homework.map((hw) => (
                <tr key={hw._id}>
                  <td><strong>{hw.title}</strong></td>
                  <td>{hw.description}</td>
                  <td>{new Date(hw.assignedDate).toLocaleDateString()}</td>
                  <td>{new Date(hw.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HomeworkManagement;

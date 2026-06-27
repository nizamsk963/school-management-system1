import React, { useState, useEffect } from 'react';
import { examService, classService } from '../../services/api';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    examDate: '',
    startTime: '',
    endTime: '',
    totalMarks: '100',
    room: '',
    description: '',
  });

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAll();
      setExams(response.data);
    } catch (err) {
      setError('Failed to fetch exams');
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

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      await examService.add(formData);
      setFormData({
        name: '',
        class: '',
        subject: '',
        examDate: '',
        startTime: '',
        endTime: '',
        totalMarks: '100',
        room: '',
        description: '',
      });
      setShowForm(false);
      fetchExams();
    } catch (err) {
      setError('Failed to add exam: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examService.delete(id);
        fetchExams();
      } catch (err) {
        setError('Failed to delete exam');
      }
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>📋 Exams Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Exam'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add New Exam</h3>
          <form onSubmit={handleAddExam}>
            <div className="form-row">
              <div className="form-group">
                <label>Exam Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Unit Test 1"
                  required
                />
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
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Marks</label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Save Exam</button>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Total Marks</th>
              <th>Room</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td>{exam.name}</td>
                <td>Grade {exam.class?.grade} - {exam.class?.section}</td>
                <td>{exam.subject?.name}</td>
                <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                <td>{exam.startTime ? `${exam.startTime} - ${exam.endTime}` : '-'}</td>
                <td>{exam.totalMarks}</td>
                <td>{exam.room || '-'}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteExam(exam._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamManagement;

import React, { useState, useEffect } from 'react';
import { homeworkService } from '../../services/api';

const StudentHomework = () => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomework();
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📖 My Homework</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {homework.map((hw) => (
                <tr key={hw._id}>
                  <td><strong>{hw.title}</strong></td>
                  <td>{hw.description}</td>
                  <td>{hw.subject?.name}</td>
                  <td>{new Date(hw.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      backgroundColor: isOverdue(hw.dueDate) ? '#fee2e2' : '#dbeafe',
                      color: isOverdue(hw.dueDate) ? '#991b1b' : '#0c4a6e',
                    }}>
                      {isOverdue(hw.dueDate) ? 'Overdue' : 'Pending'}
                    </span>
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

export default StudentHomework;

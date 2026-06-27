import React, { useState, useEffect } from 'react';
import { homeworkService } from '../../services/api';

const ParentHomework = () => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true);
        const response = await homeworkService.getAll();
        setHomework(response.data);
      } catch (err) {
        setError('Failed to load homework');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>📖 Homework Overview</h2>
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
                <th>Class</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {homework.length === 0 ? (
                <tr>
                  <td colSpan="5">No homework assignments found.</td>
                </tr>
              ) : (
                homework.map((hw) => (
                  <tr key={hw._id}>
                    <td>{hw.title}</td>
                    <td>{hw.class ? `Grade ${hw.class.grade} - ${hw.class.section}` : 'N/A'}</td>
                    <td>{hw.subject?.name || '-'}</td>
                    <td>{hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : '-'}</td>
                    <td>{hw.dueDate && new Date(hw.dueDate) < new Date() ? 'Overdue' : 'Open'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentHomework;

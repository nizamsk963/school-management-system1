import React, { useState, useEffect } from 'react';
import { marksService } from '../../services/api';

const ParentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const response = await marksService.getAll();
      setMarks(response.data);
    } catch (err) {
      setError('Failed to fetch marks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📝 Child's Marks</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Exam Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => (
                <tr key={mark._id}>
                  <td><strong>{mark.student?.firstName} {mark.student?.lastName}</strong></td>
                  <td>{mark.subject?.name}</td>
                  <td>{mark.marks}/100</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      fontWeight: 'bold',
                    }}>
                      {getGrade(mark.marks)}
                    </span>
                  </td>
                  <td>{mark.examType}</td>
                  <td>{new Date(mark.examDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentMarks;

import React, { useState, useEffect } from 'react';
import { marksService } from '../../services/api';

const PrincipalPerformance = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const response = await marksService.getAll();
        setMarks(response.data);
      } catch (err) {
        setError('Failed to load performance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  const subjectSummary = marks.reduce((summary, mark) => {
    const subjectName = mark.subject?.name || 'Unknown';
    if (!summary[subjectName]) {
      summary[subjectName] = { total: 0, count: 0 };
    }
    summary[subjectName].total += mark.marks;
    summary[subjectName].count += 1;
    return summary;
  }, {});

  const summaryRows = Object.entries(subjectSummary).map(([subject, stats]) => ({
    subject,
    average: (stats.total / stats.count).toFixed(1),
    count: stats.count,
  }));

  return (
    <div className="card">
      <div className="card-header">
        <h2>📈 Performance Overview</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <h3>Total Marks Records</h3>
              <div className="value">{marks.length}</div>
            </div>
            <div className="stat-card">
              <h3>Distinct Subjects</h3>
              <div className="value">{summaryRows.length}</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Average Score</th>
                  <th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan="3">No performance data available.</td>
                  </tr>
                ) : (
                  summaryRows.map((row) => (
                    <tr key={row.subject}>
                      <td>{row.subject}</td>
                      <td>{row.average}</td>
                      <td>{row.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PrincipalPerformance;

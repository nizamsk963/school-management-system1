import React, { useState, useEffect } from 'react';
import { marksService, studentService } from '../../services/api';

const ParentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const studentResponse = await studentService.getByParent();
        const students = studentResponse.data || [];
        const allResults = [];

        for (const student of students) {
          const studentId = student.userId?._id || student.userId;
          if (!studentId) continue;
          const response = await marksService.getByStudent(studentId);
          allResults.push(...(response.data || []).map((mark) => ({ ...mark, student })));
        }

        setResults(allResults);
      } catch (err) {
        setError('Unable to load results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const gradeForScore = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>🏆 Academic Results</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : results.length === 0 ? (
        <div className="card-content">No results available for your child(ren) yet.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Exam</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result._id}>
                  <td>{result.student?.userId?.firstName} {result.student?.userId?.lastName}</td>
                  <td>{result.subject?.name || '-'}</td>
                  <td>{result.marks}/100</td>
                  <td>{gradeForScore(result.marks)}</td>
                  <td>{result.examType || '-'}</td>
                  <td>{result.examDate ? new Date(result.examDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentResults;

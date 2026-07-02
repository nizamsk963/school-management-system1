import React, { useState, useEffect } from 'react';
import { examService, studentService } from '../../services/api';

const ParentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const studentResponse = await studentService.getByParent();
        const students = studentResponse.data || [];
        const examList = [];

        for (const student of students) {
          const classId = student.class?._id || student.class;
          if (!classId) continue;
          const response = await examService.getByClass(classId);
          examList.push(...(response.data || []).map((exam) => ({ ...exam, student })));
        }

        setExams(examList);
      } catch (err) {
        setError('Unable to load exams.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2>📋 Upcoming Exams</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : exams.length === 0 ? (
        <div className="card-content">No exams scheduled for your child(ren) right now.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam</th>
                <th>Class</th>
                <th>Date</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td>{exam.student?.userId?.firstName} {exam.student?.userId?.lastName}</td>
                  <td>{exam.title || exam.name}</td>
                  <td>{exam.class?.grade || exam.class}</td>
                  <td>{exam.date ? new Date(exam.date).toLocaleDateString() : '-'}</td>
                  <td>{exam.subject?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentExams;

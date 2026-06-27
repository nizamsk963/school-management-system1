import React, { useState, useEffect } from 'react';
import { marksService, studentService, classService, teacherService } from '../../services/api';

const getId = (value) => value?._id?.toString?.() || value?.toString?.() || '';

const MarksManagement = ({ teacherUserId }) => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    class: '',
    marks: '',
    examType: 'Unit Test',
    examDate: '',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    if (parsedUser) {
      setCurrentUser(parsedUser);
    }

    fetchMarks();
    fetchSubjects();
    fetchStudents();
    fetchClasses();

    if (parsedUser?.id || parsedUser?.userId || teacherUserId) {
      fetchTeacherProfile(parsedUser?.id || parsedUser?.userId || teacherUserId);
    }
  }, [teacherUserId]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchTeacherProfile = async (userId) => {
    try {
      const response = await teacherService.getAll();
      const teachers = response.data || [];
      const foundTeacher = teachers.find((teacher) => {
        const teacherUser = teacher.userId;
        const teacherUserId = teacherUser?._id?.toString?.() || teacherUser?.toString?.();
        const teacherLoginId = teacherUser?.userId;
        const normalizedUserId = userId?.toString?.() || userId;
        return teacherUserId === normalizedUserId || teacherUser === normalizedUserId || teacherLoginId === normalizedUserId;
      });

      if (foundTeacher?.assignedClasses?.length) {
        const assignedClassIds = new Set(foundTeacher.assignedClasses.map((cls) => getId(cls)));
        const responseStudents = await studentService.getAll();
        const filteredStudents = (responseStudents.data || []).filter((student) => {
          const studentClassId = getId(student.class);
          return assignedClassIds.has(studentClassId);
        });
        setStudents(filteredStudents);

        const responseClasses = await classService.getAll();
        const filteredClasses = (responseClasses.data || []).filter((cls) => assignedClassIds.has(getId(cls)));
        setClasses(filteredClasses);
      } else {
        setStudents([]);
        setClasses([]);
      }
    } catch (err) {
      console.error('Failed to fetch teacher profile:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
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

  const handleAddMarks = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      setError('Could not determine current user. Please log in again.');
      return;
    }

    try {
      await marksService.add({
        ...formData,
        teacher: currentUser.id || currentUser.userId,
      });
      setFormData({
        student: '',
        subject: '',
        class: '',
        marks: '',
        examType: 'Unit Test',
        examDate: '',
      });
      setShowForm(false);
      fetchMarks();
      setError('');
    } catch (err) {
      setError('Failed to add marks: ' + (err.response?.data?.message || 'Unknown error'));
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📝 Marks Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Add Marks'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>Add Student Marks</h3>
          <form onSubmit={handleAddMarks}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select name="student" value={formData.student} onChange={handleInputChange} required>
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student.userId?._id || student.userId}>
                      {student.userId?.firstName} {student.userId?.lastName} ({student.rollNumber})
                    </option>
                  ))}
                </select>
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
                <label>Marks (0-100)</label>
                <input
                  type="number"
                  name="marks"
                  min="0"
                  max="100"
                  value={formData.marks}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Exam Type</label>
                <select name="examType" value={formData.examType} onChange={handleInputChange} required>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final">Final</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success">Save Marks</button>
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
                <th>Student</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Exam Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark) => (
                <tr key={mark._id}>
                  <td>{mark.student?.firstName} {mark.student?.lastName}</td>
                  <td>{mark.subject?.name}</td>
                  <td>{mark.marks}</td>
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

export default MarksManagement;

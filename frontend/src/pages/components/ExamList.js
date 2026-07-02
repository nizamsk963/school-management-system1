import React, { useState, useEffect, useCallback } from 'react';
import { examService, teacherService, classService, studentService } from '../../services/api';

const getId = (value) => value?._id?.toString?.() || value?.toString?.() || '';

const ExamList = ({ title = 'Exams', teacherUserId, studentId, showActions = true }) => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const fetchTeacherData = useCallback(async () => {
    try {
      const userId = teacherUserId?.toString?.() || '';
      let teacher = null;

      if (userId) {
        const teachersResponse = await teacherService.getAll();
        teacher = (teachersResponse.data || []).find((item) => {
          const teacherUser = item.userId;
          const teacherObjId = teacherUser?._id?.toString?.() || teacherUser?.toString?.();
          const teacherLoginId = teacherUser?.userId;
          return teacherObjId === userId || teacherUser === userId || teacherLoginId === userId;
        });
      }

      const classesResponse = await classService.getAll();
      const allClasses = classesResponse.data || [];

      if (teacher?.assignedClasses?.length) {
        const classIds = new Set(teacher.assignedClasses.map((cls) => getId(cls)));
        setClasses(allClasses.filter((cls) => classIds.has(getId(cls))));
      } else {
        setClasses(allClasses);
      }

      const subjectsResponse = await classService.getSubjects();
      setSubjects(subjectsResponse.data || []);
    } catch (err) {
      console.error('Failed to load teacher exam data:', err);
    }
  }, [teacherUserId]);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examService.getAll();
      let examsData = response.data || [];

      if (teacherUserId) {
        const teachersResponse = await teacherService.getAll();
        const teachers = teachersResponse.data || [];
        const normalizedId = teacherUserId.toString();
        const teacher = teachers.find((item) => {
          const teacherUser = item.userId;
          const teacherObjId = teacherUser?._id?.toString?.() || teacherUser?.toString?.();
          const teacherLoginId = teacherUser?.userId;
          return teacherObjId === normalizedId || teacherUser === normalizedId || teacherLoginId === normalizedId;
        });

        if (teacher?.assignedClasses?.length) {
          const classIds = teacher.assignedClasses.map((cls) => getId(cls));
          examsData = examsData.filter((exam) => classIds.includes(getId(exam.class)));
        }
      } else if (studentId) {
        try {
          const studentResponse = await studentService.getByUserId(studentId);
          const student = studentResponse.data;
          const studentClassId = getId(student.class);
          examsData = examsData.filter((exam) => getId(exam.class) === studentClassId);
        } catch (err) {
          console.warn('Failed to resolve student class for exams:', err);
        }
      }

      setExams(examsData);
    } catch (err) {
      setError('Failed to load exams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [teacherUserId, studentId]);

  useEffect(() => {
    fetchExams();
    fetchTeacherData();
  }, [teacherUserId, studentId, fetchExams, fetchTeacherData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
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
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingId) {
        await examService.update(editingId, formData);
        setSuccessMessage('Exam updated successfully.');
      } else {
        await examService.add(formData);
        setSuccessMessage('Exam added successfully.');
      }
      resetForm();
      fetchExams();
    } catch (err) {
      setError('Failed to save exam');
      console.error(err);
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setFormData({
      name: exam.name || '',
      class: getId(exam.class),
      subject: getId(exam.subject),
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().slice(0, 10) : '',
      startTime: exam.startTime || '',
      endTime: exam.endTime || '',
      totalMarks: exam.totalMarks?.toString() || '100',
      room: exam.room || '',
      description: exam.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await examService.delete(id);
      setSuccessMessage('Exam deleted successfully.');
      fetchExams();
    } catch (err) {
      setError('Failed to delete exam');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📋 {title}</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {showActions && showForm && (
        <div className="form-container" style={{ marginBottom: '20px' }}>
          <h3>{editingId ? 'Edit Exam' : 'Add New Exam'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Exam Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Class</label>
                <select name="class" value={formData.class} onChange={handleInputChange} required>
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>Grade {cls.grade} - Section {cls.section}</option>
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
                    <option key={subject._id} value={subject._id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total Marks</label>
                <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Exam Date</label>
                <input type="date" name="examDate" value={formData.examDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Room</label>
                <input name="room" value={formData.room} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
            </div>

            <button type="submit" className="btn btn-success">{editingId ? 'Update Exam' : 'Save Exam'}</button>
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
                <th>Name</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Total Marks</th>
                <th>Room</th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 8 : 7}>No exams found.</td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.name}</td>
                    <td>{exam.class ? `Grade ${exam.class.grade} - Section ${exam.class.section}` : 'N/A'}</td>
                    <td>{exam.subject?.name || 'N/A'}</td>
                    <td>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}</td>
                    <td>{exam.startTime ? `${exam.startTime} - ${exam.endTime}` : '-'}</td>
                    <td>{exam.totalMarks}</td>
                    <td>{exam.room || '-'}</td>
                    {showActions && (
                      <td>
                        <>
                          <button className="btn btn-sm btn-primary" onClick={() => handleEdit(exam)}>Edit</button>{' '}
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exam._id)}>Delete</button>
                        </>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showActions && (
        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}>
            {showForm ? 'Cancel' : '➕ Add Exam'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamList;

import React, { useState, useEffect, useCallback } from 'react';
import { classService, teacherService } from '../../services/api';

const getTeacherIdentity = (teacherItem, teacherId) => {
  const teacherUser = teacherItem?.userId;
  const teacherUserId = teacherUser?._id?.toString?.() || teacherUser?.toString?.();
  const teacherLoginId = teacherUser?.userId;
  const teacherIdString = teacherId?.toString?.() || teacherId;
  return teacherUserId === teacherIdString || teacherUser === teacherIdString || teacherLoginId === teacherIdString;
};

const TeacherClasses = ({ teacherId }) => {
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ grade: '', section: '', subject: '' });

  const fetchTeacherData = useCallback(async () => {
    if (!teacherId) {
      setError('Teacher ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await teacherService.getAll();
      const foundTeacher = response.data.find((teacherItem) => getTeacherIdentity(teacherItem, teacherId));

      if (!foundTeacher) {
        throw new Error('Teacher profile not found');
      }

      const classResponse = await classService.getAll();
      const allClasses = classResponse.data || [];
      const teacherClasses = allClasses.filter((cls) => {
        const matchesAssigned = (foundTeacher.assignedClasses || []).some((assigned) => {
          const assignedId = assigned?._id?.toString?.() || assigned?.toString?.();
          return assignedId === cls._id;
        });
        const teacherUserId = foundTeacher.userId?._id?.toString?.() || foundTeacher.userId?.toString?.() || '';
        const matchesOwner = cls.classTeacher?._id?.toString?.() === teacherUserId;
        return matchesAssigned || matchesOwner;
      });

      const subjectsResponse = await classService.getSubjects();
      setTeacher(foundTeacher);
      setClasses(teacherClasses);
      setSubjects(subjectsResponse.data || []);
    } catch (err) {
      setError('Failed to load teacher classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        grade: Number(formData.grade),
        section: formData.section.toUpperCase(),
        classTeacher: teacher?._id || teacherId,
        subject: formData.subject,
      };

      const response = await classService.create(payload);
      const createdClass = response.data?.class || response.data;
      setSuccessMessage('Class added successfully.');
      setFormData({ grade: '', section: '', subject: '' });
      setClasses((prev) => {
        const next = createdClass ? [...prev, createdClass] : prev;
        return next;
      });
      if (createdClass) {
        setTeacher((prevTeacher) => prevTeacher ? {
          ...prevTeacher,
          assignedClasses: [...(prevTeacher.assignedClasses || []), createdClass],
        } : prevTeacher);
      }
      await fetchTeacherData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add class');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>📚 My Classes</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div className="form-row">
          <div className="form-group">
            <label>Grade</label>
            <input type="number" name="grade" min="1" max="10" value={formData.grade} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Section</label>
            <select name="section" value={formData.section} onChange={handleInputChange} required>
              <option value="">Select section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Subject</label>
          <select name="subject" value={formData.subject} onChange={handleInputChange} required>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-success">Add Class</button>
      </form>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          <p><strong>{teacher?.userId?.firstName || teacher?.firstName || ''} {teacher?.userId?.lastName || teacher?.lastName || ''}</strong></p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>Class Teacher</th>
                </tr>
              </thead>
              <tbody>
                {classes.length ? (
                  classes.map((cls) => (
                    <tr key={cls._id}>
                      <td>{cls.grade}</td>
                      <td>{cls.section}</td>
                      <td>{cls.subject?.name || 'N/A'}</td>
                      <td>{cls.classTeacher ? `${cls.classTeacher.firstName || ''} ${cls.classTeacher.lastName || ''}`.trim() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No classes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;

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

      setTeacher(foundTeacher);
      setClasses(teacherClasses);
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

  const teacherName = teacher?.userId?.firstName || teacher?.firstName || '';
  const teacherLastName = teacher?.userId?.lastName || teacher?.lastName || '';
  const teacherUserId = teacher?.userId?._id?.toString?.() || teacher?.userId?.toString?.() || '';
  const teacherClasses = classes.filter((cls) => {
    const assignedIds = (teacher?.assignedClasses || []).map((assigned) => String(assigned?._id || assigned));
    return assignedIds.includes(String(cls._id));
  });
  const monitoredClasses = teacherClasses.filter((cls) => {
    const classTeacherId = cls.classTeacher?._id?.toString?.() || cls.classTeacher?.toString?.() || '';
    return classTeacherId === teacherUserId;
  });
  const taughtClasses = teacherClasses.filter((cls) => !monitoredClasses.some((monitorClass) => monitorClass._id === cls._id));
  const sectionsResponsible = [...new Set(teacherClasses.map((cls) => cls.section).filter(Boolean))].sort();
  const gradesResponsible = [...new Set(teacherClasses.map((cls) => cls.grade).filter(Boolean))].sort((a, b) => a - b);
  const totalStudents = teacherClasses.reduce((total, cls) => total + ((cls.students || []).length), 0);
  const subjectDisplay = teacher?.isAllSubjectTeacher
    ? 'All subjects for assigned classes'
    : (teacher?.teachingSubjects?.length
      ? (teacher.teachingSubjects.map((subject) => subject?.name || subject).join(', '))
      : (teacher?.subject?.name || 'N/A'));
  const timetable = [
    { day: 'Monday', schedule: subjectDisplay },
    { day: 'Tuesday', schedule: subjectDisplay },
    { day: 'Wednesday', schedule: subjectDisplay },
    { day: 'Thursday', schedule: subjectDisplay },
    { day: 'Friday', schedule: subjectDisplay },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2>📚 Teacher Dashboard</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          <div className="form-container" style={{ marginBottom: '20px' }}>
            <h3>{teacherName} {teacherLastName}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <div>{teacher?.isAllSubjectTeacher ? 'All-subject teacher (Grades 1–5)' : 'Subject specialist (Grades 6–10)'}</div>
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <div>{teacher?.userId?.userId || 'N/A'}</div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assigned Grades</label>
                <div>{gradesResponsible.length ? gradesResponsible.map((grade) => `Grade ${grade}`).join(', ') : 'No grades assigned'}</div>
              </div>
              <div className="form-group">
                <label>Sections Responsible</label>
                <div>{sectionsResponsible.length ? sectionsResponsible.map((section) => `Section ${section}`).join(', ') : 'No sections assigned'}</div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assigned Classes</label>
                <div>{teacherClasses.length ? teacherClasses.map((cls) => `Grade ${cls.grade} · Section ${cls.section}`).join(', ') : 'No classes assigned'}</div>
              </div>
              <div className="form-group">
                <label>Total Students</label>
                <div>{totalStudents}</div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Subjects Taught</label>
                <div>{subjectDisplay}</div>
              </div>
              <div className="form-group">
                <label>Class Teacher Status</label>
                <div>{monitoredClasses.length ? `${monitoredClasses.length} monitored class${monitoredClasses.length > 1 ? 'es' : ''}` : 'No monitored classes'}</div>
              </div>
            </div>
          </div>

          <div className="form-container" style={{ marginBottom: '20px' }}>
            <h3>🏫 Monitored Classes</h3>
            {monitoredClasses.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {monitoredClasses.map((cls) => (
                  <div key={cls._id} className="card" style={{ padding: '12px' }}>
                    <h4 style={{ marginTop: 0 }}>Grade {cls.grade} · Section {cls.section}</h4>
                    <p style={{ margin: '4px 0' }}><strong>Subject:</strong> {cls.subject || 'N/A'}</p>
                    <p style={{ margin: '4px 0' }}><strong>Role:</strong> Class Teacher</p>
                    <p style={{ margin: '4px 0' }}><strong>Students:</strong> {(cls.students || []).length}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-success">No class-teacher responsibilities assigned.</div>
            )}
          </div>

          <div className="form-container" style={{ marginBottom: '20px' }}>
            <h3>📖 Classes Taught</h3>
            {taughtClasses.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {taughtClasses.map((cls) => (
                  <div key={cls._id} className="card" style={{ padding: '12px' }}>
                    <h4 style={{ marginTop: 0 }}>Grade {cls.grade} · Section {cls.section}</h4>
                    <p style={{ margin: '4px 0' }}><strong>Subject:</strong> {cls.subject || 'N/A'}</p>
                    <p style={{ margin: '4px 0' }}><strong>Role:</strong> Subject Teacher</p>
                    <p style={{ margin: '4px 0' }}><strong>Students:</strong> {(cls.students || []).length}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-success">No subject-teaching assignments beyond class monitoring.</div>
            )}
          </div>

          <div className="form-container">
            <h3>🕒 Timetable Overview</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Day</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((row) => (
                  <tr key={row.day}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.day}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;

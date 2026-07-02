const mongoose = require('mongoose');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

const generateTeacherUserId = async () => {
  const latestTeacher = await User.find({
    role: 'teacher',
    userId: /^TEACHER\d{3}$/,
  })
    .sort({ userId: -1 })
    .limit(1)
    .lean();

  let nextNumber = 1;
  if (latestTeacher.length) {
    const match = latestTeacher[0].userId.match(/^TEACHER(\d{3})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  let generatedId = `TEACHER${String(nextNumber).padStart(3, '0')}`;
  while (await User.findOne({ userId: generatedId })) {
    nextNumber += 1;
    generatedId = `TEACHER${String(nextNumber).padStart(3, '0')}`;
  }

  return generatedId;
};

const normalizeTeacherEmail = (email) => {
  if (typeof email !== 'string') {
    return undefined;
  }

  const trimmedEmail = email.trim().toLowerCase();
  return trimmedEmail || undefined;
};

const resolveTeacherEmail = async (email, firstName, lastName, fallbackUserId) => {
  const normalizedEmail = normalizeTeacherEmail(email);
  if (normalizedEmail) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      return normalizedEmail;
    }
  }

  const baseName = `${(firstName || 'teacher').toLowerCase().replace(/[^a-z0-9]+/g, '')}.${(lastName || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
  const suffix = Math.random().toString(36).slice(2, 7);
  const generatedEmail = `${baseName}${fallbackUserId ? `.${fallbackUserId}` : ''}${suffix}@school.com`;
  const existingUser = await User.findOne({ email: generatedEmail });
  if (!existingUser) {
    return generatedEmail;
  }

  return `${baseName}${suffix}${Math.random().toString(36).slice(2, 7)}@school.com`;
};

const resolveTeacherSubject = async (subject) => {
  if (subject) {
    return subject;
  }

  const fallbackSubject = await Subject.findOne();
  if (!fallbackSubject) {
    throw new Error('No subject available for teacher assignment');
  }

  return fallbackSubject._id;
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('userId')
      .populate('subject')
      .populate('teachingSubjects')
      .populate('assignedClasses');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId')
      .populate('subject')
      .populate('teachingSubjects')
      .populate('assignedClasses');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherByUserId = async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    let teacher;

    if (mongoose.Types.ObjectId.isValid(userIdParam)) {
      teacher = await Teacher.findOne({ userId: userIdParam })
        .populate('userId')
        .populate('subject')
        .populate('teachingSubjects')
        .populate('assignedClasses');
    }

    if (!teacher) {
      const user = await User.findOne({ userId: userIdParam });
      if (user) {
        teacher = await Teacher.findOne({ userId: user._id })
          .populate('userId')
          .populate('subject')
          .populate('teachingSubjects')
          .populate('assignedClasses');
      }
    }

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found for this user' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTeacher = async (req, res) => {
  try {
    const { firstName, lastName, userId, password, subject, assignedClasses, qualifications, experience, joinDate, phone, gender, email, isAllSubjectTeacher, teachingSubjects, salary, designation, bio, status } = req.body;

    let finalUserId = userId?.trim();
    if (finalUserId) {
      const duplicateUser = await User.findOne({ userId: finalUserId });
      if (duplicateUser) {
        finalUserId = await generateTeacherUserId();
      }
    } else {
      finalUserId = await generateTeacherUserId();
    }

    const normalizedEmail = await resolveTeacherEmail(email, firstName, lastName, finalUserId);
    const resolvedSubject = await resolveTeacherSubject(subject);
    const safePassword = password || 'Teacher@123';

    // Create user
    const user = new User({
      userId: finalUserId,
      password: safePassword,
      role: 'teacher',
      firstName,
      lastName,
      phone,
      gender,
      email: normalizedEmail,
    });

    await user.save();

    // Create teacher
    const teacher = new Teacher({
      userId: user._id,
      subject: resolvedSubject,
      teachingSubjects: Array.isArray(teachingSubjects) && teachingSubjects.length
        ? teachingSubjects
        : (Boolean(isAllSubjectTeacher) ? [] : [resolvedSubject]),
      isAllSubjectTeacher: Boolean(isAllSubjectTeacher),
      assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
      qualifications,
      experience,
      joinDate,
      salary,
      designation,
      bio,
      status,
    });

    await teacher.save();

    res.status(201).json(teacher);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern || error.keyValue || {})[0];
      const message = duplicateKey === 'userId'
        ? 'User ID already exists'
        : duplicateKey === 'email'
        ? 'Email already exists'
        : 'Duplicate field value detected';
      return res.status(400).json({ message });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { firstName, lastName, password, email, phone, gender, subject, qualifications, experience, joinDate, assignedClasses, isAllSubjectTeacher, teachingSubjects, salary, designation, bio, status } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (subject !== undefined) teacher.subject = subject;
    if (teachingSubjects !== undefined) teacher.teachingSubjects = teachingSubjects;
    if (isAllSubjectTeacher !== undefined) teacher.isAllSubjectTeacher = Boolean(isAllSubjectTeacher);
    if (qualifications !== undefined) teacher.qualifications = qualifications;
    if (experience !== undefined) teacher.experience = experience;
    if (joinDate !== undefined) teacher.joinDate = joinDate;
    if (assignedClasses !== undefined) teacher.assignedClasses = assignedClasses;
    if (salary !== undefined) teacher.salary = salary;
    if (designation !== undefined) teacher.designation = designation;
    if (bio !== undefined) teacher.bio = bio;
    if (status !== undefined) teacher.status = status;

    await teacher.save();

    const user = await User.findById(teacher.userId);
    if (user) {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (gender !== undefined) user.gender = gender;
      if (password) user.password = password;
      await user.save();
    }

    const updatedTeacher = await Teacher.findById(req.params.id)
      .populate('userId')
      .populate('subject')
      .populate('teachingSubjects')
      .populate('assignedClasses');
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignClassToTeacher = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $push: { assignedClasses: classId } },
      { new: true }
    ).populate('userId').populate('subject').populate('assignedClasses');
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  getTeacherByUserId,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  assignClassToTeacher,
};

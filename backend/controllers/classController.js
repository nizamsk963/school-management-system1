const Subject = require('../models/Subject');
const Class = require('../models/Class');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher')
      .populate('students');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('classTeacher')
      .populate('students');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const { grade, section, classTeacher, subject } = req.body;
    const normalizedGrade = Number(grade);
    const normalizedSection = String(section || '').trim().toUpperCase();

    if (!Number.isInteger(normalizedGrade) || normalizedGrade < 1 || normalizedGrade > 10) {
      return res.status(400).json({ message: 'Grade must be between 1 and 10' });
    }

    if (!['A', 'B', 'C'].includes(normalizedSection)) {
      return res.status(400).json({ message: 'Section must be A, B, or C' });
    }

    const existing = await Class.findOne({
      grade: normalizedGrade,
      section: { $regex: new RegExp(`^${normalizedSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (existing) {
      return res.status(200).json({ message: 'Class already exists', class: existing });
    }

    let resolvedClassTeacher = null;
    if (classTeacher) {
      const teacherQuery = Teacher.findById(classTeacher);
      const teacherProfile = teacherQuery && typeof teacherQuery.lean === 'function'
        ? await teacherQuery.lean()
        : await teacherQuery;
      resolvedClassTeacher = teacherProfile?.userId || classTeacher;
    }

    const newClass = new Class({
      grade: normalizedGrade,
      section: normalizedSection,
      ...(resolvedClassTeacher ? { classTeacher: resolvedClassTeacher } : {}),
      ...(subject ? { subject } : {}),
    });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('classTeacher')
      .populate('students');
    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const assignClassTeacher = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;
    const classData = await Class.findByIdAndUpdate(classId, { classTeacher: teacherId }, { new: true })
      .populate('classTeacher')
      .populate('students');
    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalClasses = await Class.countDocuments();

    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  assignClassTeacher,
  getDashboardStats,
};

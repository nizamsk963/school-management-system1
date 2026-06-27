const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');

const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId')
      .populate('class')
      .populate('parentId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId')
      .populate('class')
      .populate('parentId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const { firstName, lastName, userId, password, rollNumber, classId, parentId, dateOfBirth, phone, gender, admissionDate } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'Class selection is required' });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(400).json({ message: 'Selected class does not exist' });
    }

    const existingUser = await User.findOne({ userId });
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: `Roll number '${rollNumber}' is already assigned to another student.` });
    }

    let user = existingUser;
    if (existingUser) {
      if (existingUser.role !== 'student') {
        return res.status(400).json({ message: `Student user ID '${userId}' is already in use.` });
      }

      const existingStudentProfile = await Student.findOne({ userId: existingUser._id });
      if (existingStudentProfile) {
        return res.status(400).json({ message: `Student user ID '${userId}' is already in use.` });
      }

      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.dateOfBirth = dateOfBirth;
      existingUser.phone = phone;
      existingUser.gender = gender;
      if (password) {
        existingUser.password = password;
      }
      await existingUser.save();
    } else {
      user = new User({
        userId,
        password,
        role: 'student',
        firstName,
        lastName,
        dateOfBirth,
        phone,
        gender,
      });

      await user.save();
    }

    // Sanitize parentId: only set if non-empty and a valid ObjectId
    let parent = undefined;
    if (parentId && typeof parentId === 'string' && parentId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'Invalid parentId provided' });
      }
      parent = parentId;
    }

    // Create student
    const student = new Student({
      userId: user._id,
      rollNumber,
      class: classId,
      parentId: parent,
      admissionDate,
    });

    await student.save();

    // Add student to class
    await Class.findByIdAndUpdate(classId, {
      $push: { students: user._id },
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateFields = Object.keys(error.keyPattern || {}).join(', ');
      return res.status(400).json({ message: `Duplicate value for field(s): ${duplicateFields}.` });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { classId, parentId, firstName, lastName, password, phone, gender, dateOfBirth, email } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (classId !== undefined) {
      student.class = classId;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'parentId')) {
      if (!parentId || (typeof parentId === 'string' && parentId.trim() === '')) {
        student.parentId = undefined;
      } else if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'Invalid parentId provided' });
      } else {
        student.parentId = parentId;
      }
    }

    await student.save();

    const user = await User.findById(student.userId);
    if (user) {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (gender !== undefined) user.gender = gender;
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (password) user.password = password;
      await user.save();
    }

    const updatedStudent = await Student.findById(req.params.id)
      .populate('userId')
      .populate('class')
      .populate('parentId');

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const students = await Student.find({ class: classId })
      .populate('userId')
      .populate('class')
      .populate('parentId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
};

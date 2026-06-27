const test = require('node:test');
const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const studentController = require('../controllers/studentController');

test('reuses an existing student user when no student profile exists yet', async () => {
  const originalUserFindOne = User.findOne;
  const originalStudentFindOne = Student.findOne;
  const originalUserSave = User.prototype.save;
  const originalStudentSave = Student.prototype.save;
  const originalClassFindById = Class.findById;
  const originalClassFindByIdAndUpdate = Class.findByIdAndUpdate;
  const originalObjectIdIsValid = mongoose.Types.ObjectId.isValid;

  let savedUser = null;
  const existingUser = {
    _id: 'user-1',
    userId: 'STUDENT012',
    role: 'student',
    firstName: 'Old',
    lastName: 'Name',
    dateOfBirth: null,
    phone: '',
    gender: 'Male',
    password: 'old-password',
    async save() {
      savedUser = { ...this };
      return this;
    },
  };

  try {
    User.findOne = async () => existingUser;
    Student.findOne = async (filter) => {
      if (filter && filter.userId === 'user-1') {
        return null;
      }
      if (filter && filter.rollNumber === 'ROLL012') {
        return null;
      }
      return null;
    };
    User.prototype.save = async function () {
      savedUser = { ...this };
      return this;
    };
    Student.prototype.save = async function () {
      return this;
    };
    Class.findById = async () => ({ _id: 'class-1' });
    Class.findByIdAndUpdate = async () => ({ _id: 'class-1' });
    mongoose.Types.ObjectId.isValid = () => true;

    const req = {
      body: {
        firstName: 'Alice',
        lastName: 'Johnson',
        userId: 'STUDENT012',
        password: 'Secret@123',
        rollNumber: 'ROLL012',
        classId: 'class-1',
        parentId: '',
        dateOfBirth: '2008-01-01',
        phone: '1234567890',
        gender: 'Female',
        admissionDate: '2024-01-01',
      },
    };

    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await studentController.addStudent(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedUser.userId, 'STUDENT012');
    assert.strictEqual(savedUser.firstName, 'Alice');
    assert.strictEqual(savedUser.lastName, 'Johnson');
    assert.strictEqual(savedUser.password, 'Secret@123');
  } finally {
    User.findOne = originalUserFindOne;
    Student.findOne = originalStudentFindOne;
    User.prototype.save = originalUserSave;
    Student.prototype.save = originalStudentSave;
    Class.findById = originalClassFindById;
    Class.findByIdAndUpdate = originalClassFindByIdAndUpdate;
    mongoose.Types.ObjectId.isValid = originalObjectIdIsValid;
  }
});

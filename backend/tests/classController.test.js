const test = require('node:test');
const assert = require('assert');
const classController = require('../controllers/classController');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

test('createClass resolves a teacher profile id to a user id for classTeacher', async () => {
  const originalClassFindOne = Class.findOne;
  const originalClassPrototypeSave = Class.prototype.save;
  const originalTeacherFindById = Teacher.findById;
  const originalUserFindById = User.findById;

  let savedClass = null;

  try {
    Class.findOne = async () => null;
    Class.prototype.save = async function () {
      savedClass = this;
      return this;
    };
    Teacher.findById = async () => ({
      _id: '507f191e810c19729de860ea',
      userId: '507f191e810c19729de860eb',
      lean: () => ({ _id: '507f191e810c19729de860ea', userId: '507f191e810c19729de860eb' }),
    });
    User.findById = async () => ({ _id: '507f191e810c19729de860eb' });

    const req = {
      body: {
        grade: '1',
        section: 'A',
        classTeacher: 'teacher-1',
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

    await classController.createClass(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedClass.classTeacher.toString(), '507f191e810c19729de860eb');
  } finally {
    Class.findOne = originalClassFindOne;
    Class.prototype.save = originalClassPrototypeSave;
    Teacher.findById = originalTeacherFindById;
    User.findById = originalUserFindById;
  }
});

test('createClass stores a provided subject on the class', async () => {
  const originalClassFindOne = Class.findOne;
  const originalClassPrototypeSave = Class.prototype.save;

  let savedClass = null;

  try {
    Class.findOne = async () => null;
    Class.prototype.save = async function () {
      savedClass = this;
      return this;
    };

    const req = {
      body: {
        grade: '1',
        section: 'A',
        subject: 'Mathematics',
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

    await classController.createClass(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedClass.subject, 'Mathematics');
  } finally {
    Class.findOne = originalClassFindOne;
    Class.prototype.save = originalClassPrototypeSave;
  }
});

test('createClass returns an existing class when the normalized class already exists', async () => {
  const originalClassFindOne = Class.findOne;

  try {
    Class.findOne = async () => ({ _id: 'existing-class', grade: 1, section: 'A' });

    const req = {
      body: {
        grade: '1',
        section: 'a',
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

    await classController.createClass(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, 'Class already exists');
    assert.strictEqual(res.body.class._id, 'existing-class');
  } finally {
    Class.findOne = originalClassFindOne;
  }
});

test('deleteClass removes a class by id', async () => {
  const originalClassFindByIdAndDelete = Class.findByIdAndDelete;

  try {
    let deletedId = null;
    Class.findByIdAndDelete = async (id) => {
      deletedId = id;
      return { _id: id, grade: 1, section: 'A' };
    };

    const req = {
      params: {
        id: 'class-1',
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

    await classController.deleteClass(req, res);

    assert.strictEqual(deletedId, 'class-1');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, 'Class deleted successfully');
  } finally {
    Class.findByIdAndDelete = originalClassFindByIdAndDelete;
  }
});

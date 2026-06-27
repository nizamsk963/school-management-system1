const test = require('node:test');
const assert = require('assert');
const examController = require('../controllers/examController');
const Exam = require('../models/Exam');

test('addExam populates class and subject after saving', async () => {
  const originalExamSave = Exam.prototype.save;
  const originalExamFindById = Exam.findById;

  try {
    let savedExam = null;
    Exam.prototype.save = async function () {
      savedExam = this;
      return this;
    };

    Exam.findById = async () => ({
      _id: 'exam-1',
      class: { _id: 'class-1', name: 'Class 1' },
      subject: { _id: 'subject-1', name: 'Math' },
      populate: async function (path) {
        if (path === 'class') {
          this.class = { _id: 'class-1', name: 'Class 1' };
        }
        if (path === 'subject') {
          this.subject = { _id: 'subject-1', name: 'Math' };
        }
        return this;
      },
    });

    const req = {
      body: {
        name: 'Midterm',
        class: '507f191e810c19729de860ea',
        subject: '507f191e810c19729de860eb',
        examDate: '2026-06-27',
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

    await examController.addExam(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(savedExam.name, 'Midterm');
    assert.strictEqual(res.body.class._id, 'class-1');
    assert.strictEqual(res.body.subject._id, 'subject-1');
  } finally {
    Exam.prototype.save = originalExamSave;
    Exam.findById = originalExamFindById;
  }
});

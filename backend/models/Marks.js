const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      max: 100,
      min: 0,
    },
    examType: {
      type: String,
      enum: ['Unit Test', 'Mid-Term', 'Final', 'Practical'],
      required: true,
    },
    examDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Marks', marksSchema);

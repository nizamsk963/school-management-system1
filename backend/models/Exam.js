const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    startTime: String,
    endTime: String,
    totalMarks: {
      type: Number,
      default: 100,
    },
    room: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);

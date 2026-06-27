const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    assignedClasses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    }],
    qualifications: String,
    experience: Number,
    joinDate: Date,
    salary: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);

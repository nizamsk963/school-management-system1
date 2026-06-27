const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    section: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C'],
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

// Unique index for grade and section combination
classSchema.index({ grade: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);

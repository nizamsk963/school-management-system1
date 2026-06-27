const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['Mathematics', 'Science', 'Social Studies', 'English', 'Telugu', 'Hindi', 'Environmental Science (EVS)'],
    },
    code: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);

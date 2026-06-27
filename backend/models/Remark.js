const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema(
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
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    remark: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Positive', 'Negative', 'Neutral'],
      default: 'Neutral',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Remark', remarkSchema);

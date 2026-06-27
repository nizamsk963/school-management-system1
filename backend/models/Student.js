const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rollNumber: {
      type: String,
      unique: true,
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    admissionDate: Date,
    bloodGroup: String,
    emergencyContact: String,
    feesPaid: {
      type: Number,
      default: 0,
    },
    totalFees: {
      type: Number,
      default: 50000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);

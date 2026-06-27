const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    dueDate: {
      type: Date,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['PhonePe', 'Credit Card', 'Debit Card', 'Cash', 'Cheque'],
    },
    transactionId: String,
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);

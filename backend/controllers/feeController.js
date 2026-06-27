const Fee = require('../models/Fee');
const Student = require('../models/Student');

const getFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeesByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const fees = await Fee.find({ student: studentId }).populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingFees = async (req, res) => {
  try {
    const fees = await Fee.find({ isPaid: false }).populate('student');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFee = async (req, res) => {
  try {
    const fee = new Fee(req.body);
    await fee.save();
    const populated = await fee.populate('student');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const payFee = async (req, res) => {
  try {
    const { feeId, paymentMethod, transactionId } = req.body;

    const fee = await Fee.findByIdAndUpdate(
      feeId,
      {
        isPaid: true,
        paymentDate: new Date(),
        paymentMethod,
        transactionId,
      },
      { new: true }
    ).populate('student');

    // Update student's fees paid amount
    if (fee) {
      const student = await Student.findById(fee.student._id);
      if (student) {
        student.feesPaid += fee.amount;
        await student.save();
      }
    }

    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('student');
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.json({ message: 'Fee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFees,
  getFeesByStudent,
  getPendingFees,
  addFee,
  payFee,
  updateFee,
  deleteFee,
};

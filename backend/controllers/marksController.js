const Marks = require('../models/Marks');

const getMarks = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await Marks.find({ student: studentId })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarksByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const marks = await Marks.find({ class: classId })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMarks = async (req, res) => {
  try {
    const marks = new Marks(req.body);
    await marks.save();
    await marks.populate('student teacher subject class');
    res.status(201).json(marks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMarks = async (req, res) => {
  try {
    const marks = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student')
      .populate('teacher')
      .populate('subject')
      .populate('class');
    res.json(marks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMarks = async (req, res) => {
  try {
    const marks = await Marks.findByIdAndDelete(req.params.id);
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found' });
    }
    res.json({ message: 'Marks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMarks,
  getMarksByStudent,
  getMarksByClass,
  addMarks,
  updateMarks,
  deleteMarks,
};

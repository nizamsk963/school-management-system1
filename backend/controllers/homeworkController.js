const Homework = require('../models/Homework');

const getHomework = async (req, res) => {
  try {
    const homework = await Homework.find()
      .populate('class')
      .populate('subject')
      .populate('teacher');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const homework = await Homework.find({ class: classId })
      .populate('class')
      .populate('subject')
      .populate('teacher');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHomeworkBySubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const homework = await Homework.find({ subject: subjectId })
      .populate('class')
      .populate('subject')
      .populate('teacher');
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addHomework = async (req, res) => {
  try {
    const homework = new Homework(req.body);
    await homework.save();
    await homework.populate('class subject teacher');
    res.status(201).json(homework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHomework = async (req, res) => {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('class')
      .populate('subject')
      .populate('teacher');
    res.json(homework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findByIdAndDelete(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }
    res.json({ message: 'Homework deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHomework,
  getHomeworkByClass,
  getHomeworkBySubject,
  addHomework,
  updateHomework,
  deleteHomework,
};

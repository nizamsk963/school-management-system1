const express = require('express');
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, examController.getExams);
router.get('/:id', authMiddleware, examController.getExamById);
router.get('/class/:classId', authMiddleware, examController.getExamsByClass);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), examController.addExam);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), examController.updateExam);
router.delete('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), examController.deleteExam);

module.exports = router;

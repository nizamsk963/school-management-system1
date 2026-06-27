const express = require('express');
const homeworkController = require('../controllers/homeworkController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, homeworkController.getHomework);
router.get('/class/:classId', authMiddleware, homeworkController.getHomeworkByClass);
router.get('/subject/:subjectId', authMiddleware, homeworkController.getHomeworkBySubject);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), homeworkController.addHomework);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), homeworkController.updateHomework);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), homeworkController.deleteHomework);

module.exports = router;

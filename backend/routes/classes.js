const express = require('express');
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/subjects', authMiddleware, classController.getSubjects);
router.get('/', authMiddleware, classController.getClasses);
router.get('/:id', authMiddleware, classController.getClassById);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), classController.createClass);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), classController.updateClass);
router.delete('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), classController.deleteClass);
router.post('/assign-teacher', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), classController.assignClassTeacher);
router.get('/stats/dashboard', authMiddleware, classController.getDashboardStats);

module.exports = router;

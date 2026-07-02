const express = require('express');
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, teacherController.getTeachers);
router.get('/user/:userId', authMiddleware, teacherController.getTeacherByUserId);
router.get('/:id', authMiddleware, teacherController.getTeacherById);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal']), teacherController.addTeacher);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), teacherController.updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), teacherController.deleteTeacher);
router.post('/assign-class', authMiddleware, roleMiddleware(['super_admin', 'principal']), teacherController.assignClassToTeacher);

module.exports = router;

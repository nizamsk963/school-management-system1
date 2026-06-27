const express = require('express');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, studentController.getStudents);
router.get('/:id', authMiddleware, studentController.getStudentById);
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'principal']), studentController.addStudent);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), studentController.updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), studentController.deleteStudent);
router.get('/class/:classId', authMiddleware, studentController.getStudentsByClass);

module.exports = router;

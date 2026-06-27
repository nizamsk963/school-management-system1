const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, attendanceController.getAttendance);
router.get('/student/:studentId', authMiddleware, attendanceController.getAttendanceByStudent);
router.get('/class/:classId', authMiddleware, attendanceController.getAttendanceByClass);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), attendanceController.markAttendance);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), attendanceController.updateAttendance);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), attendanceController.deleteAttendance);

module.exports = router;

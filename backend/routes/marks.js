const express = require('express');
const marksController = require('../controllers/marksController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, marksController.getMarks);
router.get('/student/:studentId', authMiddleware, marksController.getMarksByStudent);
router.get('/class/:classId', authMiddleware, marksController.getMarksByClass);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), marksController.addMarks);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), marksController.updateMarks);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), marksController.deleteMarks);

module.exports = router;

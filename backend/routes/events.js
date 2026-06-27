const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, eventController.getEvents);
router.get('/:id', authMiddleware, eventController.getEventById);
router.post('/', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), eventController.addEvent);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'super_admin', 'principal']), eventController.updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'principal']), eventController.deleteEvent);

module.exports = router;

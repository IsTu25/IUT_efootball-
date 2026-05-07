const express = require('express');
const router = express.Router();
const { getNotifications, respondToInvite, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.post('/:id/respond', protect, respondToInvite);
router.put('/read-all', protect, markAllAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getMatches, getMatch, submitResult, approveResult, scheduleMatch, getRecentResults
} = require('../controllers/matchController');

router.get('/recent', protect, getRecentResults);
router.get('/', protect, getMatches);
router.get('/:id', protect, getMatch);
router.post('/:id/submit-result', protect, submitResult);
router.post('/:id/approve', protect, adminOnly, approveResult);
router.put('/:id/schedule', protect, adminOnly, scheduleMatch);

module.exports = router;

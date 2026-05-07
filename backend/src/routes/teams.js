const express = require('express');
const router = express.Router();
const { registerTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.post('/register', protect, registerTeam);

module.exports = router;

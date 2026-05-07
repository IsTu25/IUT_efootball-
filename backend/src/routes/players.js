const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer, getLeaderboard
} = require('../controllers/playerController');

router.get('/leaderboard', protect, getLeaderboard);
router.get('/', protect, getPlayers);
router.get('/:id', protect, getPlayer);
router.post('/', protect, adminOnly, createPlayer);
router.put('/:id', protect, adminOnly, updatePlayer);
router.delete('/:id', protect, adminOnly, deletePlayer);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getTournaments, getTournament, createTournament, startTournament,
  advanceToKnockout, getTournamentGroups, getTournamentMatches,
  updateTournament, deleteTournament
} = require('../controllers/tournamentController');

router.get('/', protect, getTournaments);
router.get('/:id', protect, getTournament);
router.post('/', protect, adminOnly, createTournament);
router.put('/:id', protect, adminOnly, updateTournament);
router.delete('/:id', protect, adminOnly, deleteTournament);
router.post('/:id/start', protect, adminOnly, startTournament);
router.post('/:id/advance-knockout', protect, adminOnly, advanceToKnockout);
router.get('/:id/groups', protect, getTournamentGroups);
router.get('/:id/matches', protect, getTournamentMatches);

module.exports = router;

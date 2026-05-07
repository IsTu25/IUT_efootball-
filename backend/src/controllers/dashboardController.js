const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const User = require('../models/User');

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [
      activeTournament,
      recentMatches,
      totalPlayers,
      totalTournaments,
      pendingMatches
    ] = await Promise.all([
      Tournament.findOne({ status: { $in: ['group_stage', 'knockout'] } })
        .sort({ createdAt: -1 }),
      Match.find({ status: 'completed' })
        .populate({ path: 'teamA', populate: { path: 'captain', select: 'name photo' } })
        .populate({ path: 'teamB', populate: { path: 'captain', select: 'name photo' } })
        .populate('tournament', 'name')
        .sort({ playedAt: -1 })
        .limit(10),
      User.countDocuments({ role: 'player', isActive: true }),
      Tournament.countDocuments(),
      Match.countDocuments({ status: 'pending_approval' }),
    ]);

    // Upcoming matches
    const upcomingMatches = await Match.find({ status: 'scheduled' })
      .populate({ path: 'teamA', populate: { path: 'captain', select: 'name photo' } })
      .populate({ path: 'teamB', populate: { path: 'captain', select: 'name photo' } })
      .populate('tournament', 'name')
      .sort({ scheduledAt: 1 })
      .limit(5);

    res.json({
      activeTournament,
      recentMatches,
      upcomingMatches,
      stats: { totalPlayers, totalTournaments, pendingMatches },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


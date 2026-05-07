const User = require('../models/User');
const Match = require('../models/Match');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');

// GET /api/players
exports.getPlayers = async (req, res) => {
  try {
    const players = await User.find({ role: 'player', isActive: true }).sort({ name: 1 });
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/players/:id
exports.getPlayer = async (req, res) => {
  try {
    const player = await User.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    // Stats
    const teams = await Team.find({ $or: [{ captain: player._id }, { 'members.user': player._id }] });
    const teamIds = teams.map(t => t._id.toString());
    
    const matches = await Match.find({
      status: 'completed',
      $or: [{ teamA: { $in: teams.map(t => t._id) } }, { teamB: { $in: teams.map(t => t._id) } }]
    }).populate('tournament', 'name');

    let stats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
    matches.forEach(m => {
      const isA = teamIds.includes(m.teamA.toString());
      stats.played++;
      const myScore = isA ? m.scoreA : m.scoreB;
      const oppScore = isA ? m.scoreB : m.scoreA;
      stats.goalsFor += myScore;
      stats.goalsAgainst += oppScore;
      if (myScore > oppScore) stats.won++;
      else if (myScore === oppScore) stats.drawn++;
      else stats.lost++;
    });
    stats.winRate = stats.played > 0 ? ((stats.won / stats.played) * 100).toFixed(1) : 0;
    stats.goalDifference = stats.goalsFor - stats.goalsAgainst;

    res.json({ player, stats, recentMatches: matches.slice(-10).reverse() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/players (admin only)
exports.createPlayer = async (req, res) => {
  try {
    const { name, email, password, position, joinDate } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const player = await User.create({
      name, email, password,
      position: position || 'CM',
      role: 'player',
      joinDate: joinDate || Date.now(),
      photo: req.body.photo || null
    });
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/players/:id (admin only)
exports.updatePlayer = async (req, res) => {
  try {
    const { name, email, position, isActive, photo, role } = req.body;
    const player = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, position, isActive, photo, role },
      { new: true, runValidators: true }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/players/:id (admin only)
exports.deletePlayer = async (req, res) => {
  try {
    const player = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/players/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const players = await User.find({ role: 'player', isActive: true });
    const leaderboard = await Promise.all(players.map(async (player) => {
      const teams = await Team.find({ $or: [{ captain: player._id }, { 'members.user': player._id }] });
      const teamIds = teams.map(t => t._id.toString());
      
      const matches = await Match.find({
        status: 'completed',
        $or: [{ teamA: { $in: teams.map(t => t._id) } }, { teamB: { $in: teams.map(t => t._id) } }]
      });
      let played = 0, won = 0, drawn = 0, goalsFor = 0, goalsAgainst = 0;
      matches.forEach(m => {
        const isA = teamIds.includes(m.teamA.toString());
        played++;
        goalsFor += isA ? m.scoreA : m.scoreB;
        goalsAgainst += isA ? m.scoreB : m.scoreA;
        const myScore = isA ? m.scoreA : m.scoreB;
        const oppScore = isA ? m.scoreB : m.scoreA;
        if (myScore > oppScore) won++;
        else if (myScore === oppScore) drawn++;
      });
      const winRate = played > 0 ? ((won / played) * 100).toFixed(1) : 0;
      return { player, played, won, drawn, lost: played - won - drawn, goalsFor, goalsAgainst, winRate };
    }));
    leaderboard.sort((a, b) => b.winRate - a.winRate || b.played - a.played);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

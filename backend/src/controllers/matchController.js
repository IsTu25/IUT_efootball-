const Match = require('../models/Match');
const Group = require('../models/Group');
const Tournament = require('../models/Tournament');
const { recalculateGroupStandings } = require('../utils/tournament');

// GET /api/matches
exports.getMatches = async (req, res) => {
  try {
    const { tournament, stage, status, team } = req.query;
    const filter = {};
    if (tournament) filter.tournament = tournament;
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
    if (team) filter.$or = [{ teamA: team }, { teamB: team }];

    const matches = await Match.find(filter)
      .populate({ path: 'teamA', populate: { path: 'captain members.user', select: 'name photo position' } })
      .populate({ path: 'teamB', populate: { path: 'captain members.user', select: 'name photo position' } })
      .populate('group', 'name')
      .populate('tournament', 'name status requireApproval')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/matches/:id
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({ path: 'teamA', populate: { path: 'captain members.user', select: 'name photo position' } })
      .populate({ path: 'teamB', populate: { path: 'captain members.user', select: 'name photo position' } })
      .populate('submittedBy', 'name')
      .populate('tournament', 'name requireApproval')
      .populate('group', 'name');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/matches/:id/submit-result
exports.submitResult = async (req, res) => {
  try {
    const { scoreA, scoreB } = req.body;
    if (scoreA === undefined || scoreB === undefined) return res.status(400).json({ message: 'Both scores required' });
    if (scoreA < 0 || scoreB < 0) return res.status(400).json({ message: 'Scores must be non-negative' });

    const match = await Match.findById(req.params.id)
      .populate('tournament')
      .populate('teamA')
      .populate('teamB');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.status === 'completed') return res.status(400).json({ message: 'Match already completed' });

    const requireApproval = match.tournament.requireApproval;
    const isAdmin = req.user.role === 'admin';

    // Check if the user is in teamA or teamB (must be captain or accepted member)
    const isAcceptedMember = (team, userId) => {
      if (team.captain.toString() === userId) return true;
      return team.members.some(m => m.user.toString() === userId && m.status === 'accepted');
    };

    const inTeamA = isAcceptedMember(match.teamA, req.user._id.toString());
    const inTeamB = isAcceptedMember(match.teamB, req.user._id.toString());
    
    if (!isAdmin && !inTeamA && !inTeamB) {
      return res.status(403).json({ message: 'Only authorized players or admin can submit results' });
    }

    match.scoreA = Number(scoreA);
    match.scoreB = Number(scoreB);
    match.submittedBy = req.user._id;
    match.playedAt = new Date();

    if (!requireApproval || isAdmin) {
      match.status = 'completed';
      match.winningTeam = match.scoreA > match.scoreB ? match.teamA._id :
                     match.scoreB > match.scoreA ? match.teamB._id : null;
      // Recalculate group standings if group stage
      if (match.group) {
        await recalculateGroupStandings(match.group);
      }
    } else {
      match.status = 'pending_approval';
    }

    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/matches/:id/approve (admin)
exports.approveResult = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.status !== 'pending_approval') return res.status(400).json({ message: 'Match not pending approval' });

    match.status = 'completed';
    match.winningTeam = match.scoreA > match.scoreB ? match.teamA :
                   match.scoreB > match.scoreA ? match.teamB : null;
    await match.save();

    if (match.group) await recalculateGroupStandings(match.group);
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/matches/:id/schedule (admin)
exports.scheduleMatch = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    const match = await Match.findByIdAndUpdate(req.params.id, { scheduledAt }, { new: true })
      .populate('playerA playerB', 'name photo');
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/matches/recent
exports.getRecentResults = async (req, res) => {
  try {
    const matches = await Match.find({ status: 'completed' })
      .populate('playerA', 'name photo')
      .populate('playerB', 'name photo')
      .populate('tournament', 'name')
      .sort({ playedAt: -1 })
      .limit(20);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

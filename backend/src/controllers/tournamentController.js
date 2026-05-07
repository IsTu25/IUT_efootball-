const Tournament = require('../models/Tournament');
const Group = require('../models/Group');
const Match = require('../models/Match');
const { distributePlayersIntoGroups, generateRoundRobinMatches, generateKnockoutBracket } = require('../utils/tournament');

// GET /api/tournaments
exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tournaments/:id
exports.getTournament = async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id).populate({
      path: 'teams',
      populate: { path: 'captain members.user', select: 'name photo position playerId' }
    });
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tournaments (admin)
exports.createTournament = async (req, res) => {
  try {
    const { name, format, teamSize, startDate, endDate, registrationEndDate, description, groupCount, advanceCount, requireApproval } = req.body;

    const tournament = await Tournament.create({
      name, format, teamSize, startDate, endDate, registrationEndDate,
      description,
      teams: [], groupCount: groupCount || 0,
      playersPerGroup: 0,
      advanceCount: advanceCount || 2,
      requireApproval: requireApproval || false,
      createdBy: req.user._id,
    });

    // Notify all users
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const allUsers = await User.find({ _id: { $ne: req.user._id } }); // notify everyone except the creator
    
    const notifications = allUsers.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: 'tournament_announcement',
      tournament: tournament._id,
      message: `A new tournament "${name}" has been announced! Register before ${new Date(registrationEndDate).toLocaleDateString()}.`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tournaments/:id/start (admin) - generate groups & matches
exports.startTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('teams');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (tournament.status !== 'upcoming') return res.status(400).json({ message: 'Tournament already started' });

    // Filter only completed teams
    const completeTeams = tournament.teams.filter(t => t.isComplete);
    if (completeTeams.length < 2) return res.status(400).json({ message: 'At least 2 complete teams required to start' });

    const groupCount = tournament.groupCount || Math.ceil(completeTeams.length / 5) || 1;
    const { distributeTeamsIntoGroups, generateRoundRobinMatches, generateKnockoutBracket } = require('../utils/tournament');
    const teamGroups = distributeTeamsIntoGroups(completeTeams, groupCount);
    const groupLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const createdGroups = [];

    for (let i = 0; i < teamGroups.length; i++) {
      const teams = teamGroups[i];
      const standings = teams.map(t => ({
        team: t._id, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
      }));
      const group = await Group.create({
        tournament: tournament._id,
        name: `Group ${groupLabels[i]}`,
        teams: teams.map(t => t._id),
        standings,
      });
      createdGroups.push(group);

      const matchPairs = generateRoundRobinMatches(teams);
      await Match.insertMany(matchPairs.map((pair, idx) => ({
        tournament: tournament._id,
        group: group._id,
        stage: 'group',
        roundNumber: Math.floor(idx / Math.floor(teams.length / 2)) + 1,
        teamA: pair.teamA._id,
        teamB: pair.teamB._id,
        status: 'scheduled',
      })));
    }

    tournament.status = 'group_stage';
    await tournament.save();
    res.json({ message: 'Tournament started', groups: createdGroups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tournaments/:id/advance-knockout (admin)
exports.advanceToKnockout = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const groups = await Group.find({ tournament: tournament._id });
    const pendingMatches = await Match.countDocuments({
      tournament: tournament._id, stage: 'group', status: 'scheduled'
    });
    if (pendingMatches > 0) {
      return res.status(400).json({ message: `${pendingMatches} group stage matches still pending` });
    }

    const { generateKnockoutBracket } = require('../utils/tournament');
    await generateKnockoutBracket(tournament, groups, tournament.advanceCount);
    tournament.status = 'knockout';
    tournament.currentRound = 'round_of_16';
    await tournament.save();
    res.json({ message: 'Knockout stage generated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tournaments/:id/groups
exports.getTournamentGroups = async (req, res) => {
  try {
    const groups = await Group.find({ tournament: req.params.id })
      .populate({ path: 'teams', populate: { path: 'captain' } })
      .populate({ path: 'standings.team', populate: { path: 'captain' } });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tournaments/:id/matches
exports.getTournamentMatches = async (req, res) => {
  try {
    const { stage } = req.query;
    const filter = { tournament: req.params.id };
    if (stage) filter.stage = stage;
    const matches = await Match.find(filter)
      .populate({ path: 'teamA', populate: { path: 'captain' } })
      .populate({ path: 'teamB', populate: { path: 'captain' } })
      .populate('group', 'name')
      .sort({ stage: 1, roundNumber: 1, bracketPosition: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tournaments/:id (admin)
exports.updateTournament = async (req, res) => {
  try {
    const { name, description, endDate } = req.body;
    const t = await Tournament.findByIdAndUpdate(req.params.id, { name, description, endDate }, { new: true });
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tournaments/:id (admin)
exports.deleteTournament = async (req, res) => {
  try {
    await Tournament.findByIdAndDelete(req.params.id);
    await Group.deleteMany({ tournament: req.params.id });
    await Match.deleteMany({ tournament: req.params.id });
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

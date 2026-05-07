const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /api/teams/register
exports.registerTeam = async (req, res) => {
  try {
    const { tournamentId, name, invitedPlayerIds } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (tournament.status !== 'upcoming') return res.status(400).json({ message: 'Tournament has already started' });

    // Ensure user isn't already in a team for this tournament
    const existingTeam = await Team.findOne({
      tournament: tournamentId,
      $or: [
        { captain: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    if (existingTeam) return res.status(400).json({ message: 'You are already registered or invited to a team for this tournament' });

    // Validate invited players
    let memberDocs = [];
    if (invitedPlayerIds && invitedPlayerIds.length > 0) {
      const users = await User.find({ playerId: { $in: invitedPlayerIds } });
      if (users.length !== invitedPlayerIds.length) {
        return res.status(400).json({ message: 'One or more player IDs are invalid' });
      }
      if (users.length + 1 !== tournament.teamSize) {
        return res.status(400).json({ message: `You must invite exactly ${tournament.teamSize - 1} players for a ${tournament.teamSize}v${tournament.teamSize} tournament` });
      }
      // Check if any invited player is already in a team
      for (const u of users) {
        const inTeam = await Team.findOne({
          tournament: tournamentId,
          $or: [{ captain: u._id }, { 'members.user': u._id }]
        });
        if (inTeam) return res.status(400).json({ message: `Player ${u.name} is already in a team for this tournament` });
      }
      
      memberDocs = users.map(u => ({ user: u._id, status: 'pending' }));
    } else if (tournament.teamSize > 1) {
      return res.status(400).json({ message: `This is a ${tournament.teamSize}v${tournament.teamSize} tournament. You must invite ${tournament.teamSize - 1} players.` });
    }

    const isComplete = tournament.teamSize === 1;

    const team = await Team.create({
      name: name || `${req.user.name}'s Team`,
      tournament: tournamentId,
      captain: req.user._id,
      members: memberDocs,
      isComplete
    });

    if (isComplete) {
      tournament.teams.push(team._id);
      await tournament.save();
    } else {
      // Send notifications
      const notifications = memberDocs.map(m => ({
        recipient: m.user,
        sender: req.user._id,
        type: 'team_invite',
        team: team._id,
        tournament: tournament._id,
        message: `${req.user.name} invited you to join "${team.name}" for ${tournament.name}`
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

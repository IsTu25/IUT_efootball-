const Notification = require('../models/Notification');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name photo')
      .populate('tournament', 'name')
      .populate('team', 'name isComplete')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notifications/:id/respond
exports.respondToInvite = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'
    if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.status !== 'unread') return res.status(400).json({ message: 'Already responded to this invite' });

    notification.status = status;
    await notification.save();

    if (status === 'accepted') {
      const team = await Team.findById(notification.team);
      if (!team) return res.status(404).json({ message: 'Team no longer exists' });

      // Update member status
      const memberIndex = team.members.findIndex(m => m.user.toString() === req.user._id.toString());
      if (memberIndex !== -1) {
        team.members[memberIndex].status = 'accepted';
      }
      
      // Check if all members accepted
      const allAccepted = team.members.every(m => m.status === 'accepted');
      if (allAccepted) {
        team.isComplete = true;
        const tournament = await Tournament.findById(team.tournament);
        if (tournament && !tournament.teams.includes(team._id)) {
          tournament.teams.push(team._id);
          await tournament.save();
        }
      }
      await team.save();
    } else {
      // If declined, the team is broken (or captain needs to invite someone else).
      // For simplicity, we can just leave the team incomplete. The captain would have to delete the team and recreate it.
    }

    res.json({ message: `Invitation ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, status: 'unread', type: { $ne: 'team_invite' } },
      { $set: { status: 'read' } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

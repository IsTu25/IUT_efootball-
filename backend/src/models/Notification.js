const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['team_invite', 'tournament_announcement'], required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  status: { type: String, enum: ['unread', 'read', 'accepted', 'declined'], default: 'unread' },
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
}, { _id: false });

const groupSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  name: { type: String, required: true }, // e.g. "Group A"
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  standings: [standingSchema],
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);

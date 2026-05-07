const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  format: { type: String, enum: ['round_robin', 'ucl'], required: true },
  status: {
    type: String,
    enum: ['upcoming', 'group_stage', 'knockout', 'completed'],
    default: 'upcoming'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  registrationEndDate: { type: Date, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  teamSize: { type: Number, enum: [1, 2, 4, 8, 11], default: 1 },
  groupCount: { type: Number, default: 0 },
  playersPerGroup: { type: Number, default: 0 },
  advanceCount: { type: Number, default: 2 }, // top N from each group advance
  requireApproval: { type: Boolean, default: false },
  currentRound: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);

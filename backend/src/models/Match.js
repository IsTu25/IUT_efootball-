const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // null for knockout
  stage: {
    type: String,
    enum: ['group', 'round_of_16', 'quarter_final', 'semi_final', 'final'],
    default: 'group'
  },
  roundNumber: { type: Number, default: 1 }, // within group stage
  bracketPosition: { type: Number, default: null }, // for knockout bracket ordering
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  scoreA: { type: Number, default: null },
  scoreB: { type: Number, default: null },
  winningTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  status: {
    type: String,
    enum: ['scheduled', 'pending_approval', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledAt: { type: Date, default: null },
  playedAt: { type: Date, default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resultNotes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'player'], default: 'player' },
  photo: { type: String, default: null },           // base64 or URL
  position: {
    type: String,
    enum: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'],
    default: 'CM'
  },
  // New eFootball profile fields
  efootballId: { type: String, default: '', trim: true },   // eFootball user ID
  deviceName: { type: String, default: '', trim: true },    // e.g. PS5, Xbox, Mobile
  bio: { type: String, default: '', maxlength: 200 },
  profileCompleted: { type: Boolean, default: false },

  // Unique search ID
  playerId: { type: String, unique: true },

  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  // Generate random 8-character ID for new users
  if (!this.playerId) {
    const crypto = require('crypto');
    this.playerId = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

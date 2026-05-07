const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { 
  expiresIn: process.env.JWT_EXPIRE || '7d' 
});

// POST /api/auth/register  (public – players self-register)
exports.register = async (req, res) => {
  try {
    const { name, email, password, position, efootballId, deviceName, bio, photo } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    // Gmail validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only Gmail addresses are allowed for registration' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // Check if efootballId is already in use
    if (efootballId) {
      const idTaken = await User.findOne({ efootballId: efootballId.trim() });
      if (idTaken) return res.status(409).json({ message: 'eFootball ID already in use by another account' });
    }

    const profileCompleted = !!(efootballId && deviceName);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'player',
      position: position || 'CM',
      efootballId: efootballId?.trim() || '',
      deviceName: deviceName?.trim() || '',
      bio: bio?.trim() || '',
      photo: photo || null,
      profileCompleted,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/profile  — player updates own profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, position, efootballId, deviceName, bio, photo } = req.body;

    // If efootballId is changing, check uniqueness
    if (efootballId && efootballId !== req.user.efootballId) {
      const idTaken = await User.findOne({ efootballId: efootballId.trim(), _id: { $ne: req.user._id } });
      if (idTaken) return res.status(409).json({ message: 'eFootball ID already in use by another account' });
    }

    const profileCompleted = !!(
      (efootballId ?? req.user.efootballId) &&
      (deviceName ?? req.user.deviceName)
    );

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name: name.trim() }),
        ...(position && { position }),
        ...(efootballId !== undefined && { efootballId: efootballId.trim() }),
        ...(deviceName !== undefined && { deviceName: deviceName.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(photo !== undefined && { photo }),
        profileCompleted,
      },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

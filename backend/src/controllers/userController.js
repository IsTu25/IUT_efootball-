const User = require('../models/User');

// GET /api/users/:id - Get public profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -isActive -email'); // Don't expose sensitive info
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile - Update own profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const { name, photo, position, efootballId, deviceName, bio } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (photo) user.photo = photo;
    if (position) user.position = position;
    if (efootballId) user.efootballId = efootballId;
    if (deviceName) user.deviceName = deviceName;
    if (bio) user.bio = bio;
    
    user.profileCompleted = true;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

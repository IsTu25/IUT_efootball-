const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({ playerId: { $exists: false } });
  for (let u of users) {
    u.playerId = require('crypto').randomBytes(4).toString('hex').toUpperCase();
    await u.save();
  }
  console.log('Done backfilling ' + users.length + ' users');
  process.exit();
}).catch(console.error);

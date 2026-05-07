require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const adminExists = await User.findOne({ email: 'admin@club.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@club.com',
      password: 'admin123',
      role: 'admin',
      position: 'CM',
    });
    console.log('✅ Admin created: admin@club.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Create sample players
  const samplePlayers = [
    { name: 'Cristiano R.', email: 'cr7@club.com', position: 'ST' },
    { name: 'Leo M.', email: 'leo@club.com', position: 'CF' },
    { name: 'Neymar Jr.', email: 'ney@club.com', position: 'LW' },
    { name: 'Kylian M.', email: 'kylian@club.com', position: 'RW' },
    { name: 'Erling H.', email: 'erling@club.com', position: 'ST' },
    { name: 'Vinicius J.', email: 'vini@club.com', position: 'LW' },
    { name: 'Pedri G.', email: 'pedri@club.com', position: 'CM' },
    { name: 'Bellingham J.', email: 'jude@club.com', position: 'CAM' },
    { name: 'Rodri H.', email: 'rodri@club.com', position: 'CDM' },
    { name: 'Kevin D.', email: 'kdb@club.com', position: 'CAM' },
  ];

  for (const p of samplePlayers) {
    const exists = await User.findOne({ email: p.email });
    if (!exists) {
      await User.create({ ...p, password: 'player123', role: 'player' });
      console.log(`✅ Player created: ${p.name} (${p.email} / player123)`);
    }
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

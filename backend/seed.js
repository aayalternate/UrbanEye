const User = require('./models/User');

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create([
        { username: 'user1', password: 'pass1', role: 'user' },
        { username: 'user2', password: 'pass2', role: 'user' },
        { username: 'admin', password: 'adminpassword', role: 'admin' },
      ]);
      console.log('Mock users seeded successfully.');
    } else {
      console.log('Users already exist in database.');
    }
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
  }
};

module.exports = seedUsers;

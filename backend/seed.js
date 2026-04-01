const User = require('./models/User');

const seedUsers = async () => {
  try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.create([
          { username: 'user1', password: 'pass1', role: 'user' },
          { username: 'user2', password: 'pass2', role: 'user' },
          { username: 'admin', password: 'adminpassword', role: 'admin', level: 'All', department: 'All' },
          { username: 'admin_panchayat_health', password: 'adminpassword', role: 'admin', level: 'Panchayat', department: 'Health' },
          { username: 'admin_district_health', password: 'adminpassword', role: 'admin', level: 'District', department: 'Health' },
          { username: 'admin_state_health', password: 'adminpassword', role: 'admin', level: 'State', department: 'Health' },
          { username: 'admin_panchayat_roads', password: 'adminpassword', role: 'admin', level: 'Panchayat', department: 'Roads' },
          { username: 'admin_panchayat_water', password: 'adminpassword', role: 'admin', level: 'Panchayat', department: 'Water' },
          { username: 'admin_panchayat_electricity', password: 'adminpassword', role: 'admin', level: 'Panchayat', department: 'Electricity' },
          { username: 'admin_panchayat_other', password: 'adminpassword', role: 'admin', level: 'Panchayat', department: 'Other' },
        ]);
        console.log('Mock users seeded successfully.');
      } else {
        console.log('Users already exist in DB. Skipping seeding.');
      }
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
  }
};

module.exports = seedUsers;

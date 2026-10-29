const mongoose = require('mongoose');

// Configure Google Public DNS for MongoDB Atlas SRV lookup
try {
  require('dns').setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const app = require('../backend/src/app');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('[Vercel Serverless] MONGO_URI environment variable not set!');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Vercel Serverless] MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed if newly deployed empty cloud database
    try {
      const { User } = require('../backend/src/models');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Vercel Serverless] Empty database detected. Auto-seeding initial users...');
        const seedCompleteCorpus = require('../backend/src/scripts/seedCompletePortalCorpus');
        await seedCompleteCorpus();
      }
    } catch (seedErr) {
      console.warn('[Vercel Serverless] Auto-seed notice:', seedErr.message);
    }
  } catch (error) {
    console.error(`[Vercel Serverless DB Error] ${error.message}`);
  }
};

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};

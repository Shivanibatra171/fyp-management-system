const dotenv = require('dotenv');

// Load environment variables before anything else
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if newly connected empty cloud database
    try {
      const { User } = require('./src/models');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Server Startup] Empty database detected. Auto-seeding initial users, proposals, and past FYPs...');
        const seedCompleteCorpus = require('./src/scripts/seedCompletePortalCorpus');
        await seedCompleteCorpus();
      }
    } catch (seedErr) {
      console.warn('[Server Startup] Auto-seed notice:', seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(
        `[Server] FYP Management Backend running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[UnhandledRejection Error] ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error(`[UncaughtException Error] ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server Startup Failed] ${error.message}`);
    process.exit(1);
  }
};

startServer();

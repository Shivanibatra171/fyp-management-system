/**
 * Standalone MongoDB persistent runner.
 * Persists all collections and documents to local disk at backend/data_db
 * Listens on port 27017 so standard Mongoose MONGO_URI works seamlessly.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

async function startMongo() {
  try {
    const dbDir = path.join(__dirname, 'data_db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'fyp_management',
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
      },
    });

    console.log('[MongoPersistentServer] MongoDB running on port 27017');
    console.log('[MongoPersistentServer] Persistent dbPath:', dbDir);
    console.log('[MongoPersistentServer] Connection URI:', mongod.getUri());

    // Keep process alive
    setInterval(() => {}, 1000 * 60 * 60);

    const cleanup = async () => {
      console.log('\n[MongoPersistentServer] Stopping MongoDB...');
      await mongod.stop();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (error) {
    if (error.message && error.message.includes('EADDRINUSE')) {
      console.log('[MongoPersistentServer] Port 27017 is already in use by another MongoDB process.');
      process.exit(0);
    }
    console.error('[MongoPersistentServer Error]', error.message);
    process.exit(1);
  }
}

startMongo();

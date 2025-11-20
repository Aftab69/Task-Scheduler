import 'dotenv/config';
import mongoose from 'mongoose';

console.log('🔍 Checking MongoDB Atlas Data');
console.log('================================');

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const db = conn.connection.db;
  console.log('Database name:', db.databaseName);

  // List all databases
  const admin = conn.connection.db.admin();
  const databases = await admin.listDatabases();
  console.log('\n📋 Available databases:');
  databases.databases.forEach(db => {
    console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
  });

  // List all collections in current database
  const collections = await db.listCollections().toArray();
  console.log('\n📋 Collections in current database:');
  if (collections.length === 0) {
    console.log('No collections found');
  } else {
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
  }

  // Check for tasks collection specifically
  const tasksCollection = db.collection('tasks');
  const taskCount = await tasksCollection.countDocuments();
  console.log(`\n📝 Tasks collection has ${taskCount} documents`);

  if (taskCount > 0) {
    const tasks = await tasksCollection.find({}).toArray();
    console.log('\n📋 Sample tasks:');
    tasks.slice(0, 3).forEach((task, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(`  ID: ${task.id}`);
      console.log(`  Text: ${task.text}`);
      console.log(`  Date: ${task.date}`);
      console.log(`  Completed: ${task.completed}`);
      console.log(`  MongoDB _id: ${task._id}`);
    });

    if (taskCount > 3) {
      console.log(`\n... and ${taskCount - 3} more tasks`);
    }
  }

  await conn.disconnect();
  console.log('\n✅ Disconnected from MongoDB Atlas');

} catch (error) {
  console.error('❌ Error:', error.message);
}

process.exit(0);
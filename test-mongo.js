import 'dotenv/config';
import mongoose from 'mongoose';

console.log('🔍 MongoDB Atlas Connection Test');
console.log('=====================================');

// Test the connection string
const MONGODB_URI = process.env.MONGODB_URI;
console.log('Connection string:', MONGODB_URI ? 'Provided' : 'Missing');

if (MONGODB_URI) {
  // Extract and show parts of the connection string (without password)
  try {
    const url = new URL(MONGODB_URI);
    console.log('Username:', url.username);
    console.log('Password length:', url.password ? url.password.length : 0);
    console.log('Hostname:', url.hostname);
    console.log('Database:', url.pathname.slice(1) || 'default');
  } catch (error) {
    console.log('Error parsing connection string:', error.message);
  }
}

console.log('\n📋 Testing connection...');

try {
  const conn = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000
  });

  console.log('✅ Connection successful!');
  console.log(`Connected to: ${conn.connection.host}`);
  console.log(`Database: ${conn.connection.name}`);

  // Test a simple operation
  const db = conn.connection.db;
  const collections = await db.listCollections().toArray();
  console.log(`Collections found: ${collections.length}`);

  await conn.disconnect();
  console.log('✅ Disconnected successfully');

} catch (error) {
  console.log('❌ Connection failed!');
  console.log('Error type:', error.constructor.name);
  console.log('Error message:', error.message);

  if (error.code) {
    console.log('Error code:', error.code);
  }

  if (error.codeName) {
    console.log('Error name:', error.codeName);
  }

  // Specific troubleshooting based on error
  if (error.message.includes('auth')) {
    console.log('\n🔧 Authentication troubleshooting:');
    console.log('1. Double-check username spelling');
    console.log('2. Verify password exactly matches (case-sensitive)');
    console.log('3. Check if user was created in the correct database');
    console.log('4. Verify user has read/write permissions');
  }

  if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
    console.log('\n🔧 Hostname troubleshooting:');
    console.log('1. Check cluster name is correct');
    console.log('2. Verify cluster is active in Atlas');
  }
}

process.exit(0);
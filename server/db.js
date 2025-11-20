import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string format:', process.env.MONGODB_URI ? 'Provided' : 'Missing');

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database connected successfully!');

  } catch (error) {
    console.error('Database connection error:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);

    if (error.codeName === 'AtlasError') {
      console.log('\n🔍 Atlas Connection Troubleshooting:');
      console.log('1. Check if username is correct:', process.env.MONGODB_URI?.split('://')[1]?.split(':')[0]);
      console.log('2. Check if password is URL-encoded properly');
      console.log('3. Check if cluster name is correct');
      console.log('4. Check if user has proper permissions');
      console.log('5. Check if IP address is whitelisted in Atlas');
    }

    process.exit(1);
  }
};

export default connectDB;
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

console.log('Testing database connection...');

const testDBConnection = async () => {
  try {
    await connectDB();
    console.log('✅ Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

testDBConnection();

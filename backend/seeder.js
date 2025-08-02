const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // <-- This path is now correct
const adminData = require('./data/admin');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeder...');
    } catch (err) {
        console.error(`DB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

const createAdmin = async () => {
    await connectDB();
    try {
        const adminExists = await User.findOne({ email: adminData.email });
        
        if (adminExists) {
            console.log(`Admin user '${adminData.email}' already exists. No action taken.`);
        } else {
            await User.create(adminData);
            console.log(`SUCCESS: Admin user '${adminData.email}' created successfully!`);
        }

    } catch (error) {
        console.error(`SEEDER SCRIPT ERROR: ${error}`);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

createAdmin();
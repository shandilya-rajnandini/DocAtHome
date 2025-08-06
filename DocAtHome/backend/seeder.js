const mongoose = require('mongoose');
const dotenv = 'dotenv';
const { faker } = require('@faker-js/faker');
const User = require('../models/User');

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

const importData = async () => {
    await connectDB();
    try {
        await User.deleteMany({ role: 'doctor' });
        console.log('Old doctors cleared.');

        const specialties = ['Cardiologist', 'Dermatologist', 'Gynecologist', 'Dentist', 'Pediatrician', 'General Physician', 'Neurologist'];
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];
        
        const doctorsToCreate = [];
        for (let i = 0; i < 50; i++) {
            doctorsToCreate.push({
                name: `Dr. ${faker.person.firstName()} ${faker.person.lastName()}`,
                email: faker.internet.email().toLowerCase(),
                password: 'password123',
                role: 'doctor',
                specialty: faker.helpers.arrayElement(specialties),
                city: faker.helpers.arrayElement(cities),
                experience: faker.number.int({ min: 2, max: 25 }),
                licenseNumber: `DOC-${faker.string.alphanumeric(8).toUpperCase()}`,
                govId: `GOV-${faker.string.alphanumeric(8).toUpperCase()}`,
                isVerified: true, // Absolutely critical
            });
        }
        
        // Using create is safer as it triggers Mongoose validation and hooks for each doc
        await User.create(doctorsToCreate);
        console.log(`${doctorsToCreate.length} Doctors created successfully.`);

    } catch (error) {
        console.error(`SEEDER SCRIPT ERROR: ${error}`);
    } finally {
        // Ensure the connection is closed and the process exits
        await mongoose.connection.close();
        process.exit();
    }
};

importData();
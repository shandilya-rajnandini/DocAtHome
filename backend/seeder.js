const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/User'); // <-- This path is now correct
const adminData = require('./data/admin');

const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const Quest = require('./models/Quest');
const UserQuest = require('./models/UserQuest');
const quests = require('./data/quests');


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
    try {
        // Clear existing data before import
        const deletePromises = [
            User.deleteMany({ role: 'doctor' }),
            Quest.deleteMany(),
            UserQuest.deleteMany()
        ];
        
        const deleteResults = await Promise.allSettled(deletePromises);
        const failedDeletes = deleteResults.filter(result => result.status === 'rejected');
        
        if (failedDeletes.length > 0) {
            console.warn('Some delete operations failed:', failedDeletes);
        }
        
        console.log('Cleared old doctors, quests, and user quests.');

        // Create Doctors
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
                isVerified: true,
            });
        }
        await User.create(doctorsToCreate);
        console.log(`${doctorsToCreate.length} Doctors created successfully.`);

        // Import Quests
        // Validate quest data structure
        const validQuests = quests.filter(quest =>
            quest.title && quest.description &&
            typeof quest.points === 'number' &&
            typeof quest.durationDays === 'number'
        );

        if (validQuests.length !== quests.length) {
            console.warn(`${quests.length - validQuests.length} invalid quests filtered out`);
        }

        await Quest.insertMany(validQuests);
        console.log(`${validQuests.length} Quests imported successfully.`);
        console.log('Data Imported!');
    } catch (error) {
        console.error(`SEEDER IMPORT ERROR: ${error}`);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany({ role: 'doctor' });
        await Quest.deleteMany();
        await UserQuest.deleteMany();
        console.log('Destroyed doctors, quests, and user quests.');
    } catch (error) {
        console.error(`SEEDER DESTROY ERROR: ${error}`);
    }
};

const run = async () => {
    await connectDB();

    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }

    await mongoose.connection.close();
    process.exit();
};

run();

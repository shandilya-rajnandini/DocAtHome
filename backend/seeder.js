const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const { getUniquePasswordForUser } = require('./utils/passwordUtils');

const User = require('./models/User');
const Quest = require('./models/Quest');
const UserQuest = require('./models/UserQuest');
const adminData = require('./data/admin');
const quests = require('./data/quests');

dotenv.config();

const connectDB = require('./config/db');

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

        // Create Admin User (only if it doesn't exist)
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log(`Admin user '${adminData.email}' already exists. No action taken.`);
        } else {
            await User.create(adminData);
            console.log(`SUCCESS: Admin user '${adminData.email}' created successfully!`);
        }

        // Create Doctors with secure passwords
        const specialties = ['Cardiologist', 'Dermatologist', 'Gynecologist', 'Dentist', 'Pediatrician', 'General Physician', 'Neurologist'];
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Patna', 'Kolkata', 'Chennai'];
        
        const doctorsToCreate = [];
        for (let i = 0; i < 50; i++) {
            const email = faker.internet.email().toLowerCase();
            doctorsToCreate.push({
                name: `Dr. ${faker.person.firstName()} ${faker.person.lastName()}`,
                email: email,
                password: getUniquePasswordForUser(email),
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
        console.log(`${doctorsToCreate.length} Doctors created successfully with secure passwords.`);

        // Import Quests
        const createdQuests = await Quest.create(quests);
        console.log(`${createdQuests.length} Quests imported successfully.`);

        console.log('✅ Data import completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing data:', error.message);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Quest.deleteMany();
        await UserQuest.deleteMany();
        console.log('✅ Data destroyed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error destroying data:', error.message);
        process.exit(1);
    }
};

// Command line execution
if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
    connectDB().then(destroyData);
} else {
    connectDB().then(importData);
}

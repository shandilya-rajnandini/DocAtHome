const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const { getUniquePasswordForUser } = require('./utils/passwordUtils');

const User = require('./models/User');
const Quest = require('./models/Quest');
const UserQuest = require('./models/UserQuest');
const adminData = require('./data/admin');
const quests = require('./data/quests');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully.');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
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
        
        // City coordinates for approximate locations (latitude, longitude)
        const cityCoordinates = {
            'Mumbai': [19.0760, 72.8777],
            'Delhi': [28.7041, 77.1025],
            'Bangalore': [12.9716, 77.5946],
            'Pune': [18.5204, 73.8567],
            'Patna': [25.5941, 85.1376],
            'Kolkata': [22.5726, 88.3639],
            'Chennai': [13.0827, 80.2707]
        };
        
        const doctorsToCreate = [];
        for (let i = 0; i < 50; i++) {
            const email = faker.internet.email().toLowerCase();
            const city = faker.helpers.arrayElement(cities);
            const baseLat = cityCoordinates[city][0];
            const baseLng = cityCoordinates[city][1];
            
            // Add some randomization within a 10km radius for privacy
            const randomLatOffset = (faker.number.float({ min: -0.09, max: 0.09 })); // ~10km variance
            const randomLngOffset = (faker.number.float({ min: -0.09, max: 0.09 })); // ~10km variance
            
            doctorsToCreate.push({
                name: `Dr. ${faker.person.firstName()} ${faker.person.lastName()}`,
                email: email,
                password: getUniquePasswordForUser(email),
                role: 'doctor',
                specialty: faker.helpers.arrayElement(specialties),
                city: city,
                experience: faker.number.int({ min: 2, max: 25 }),
                licenseNumber: `DOC-${faker.string.alphanumeric(8).toUpperCase()}`,
                govId: `GOV-${faker.string.alphanumeric(8).toUpperCase()}`,
                isVerified: true,
                // Add location coordinates for map display
                location: {
                    type: 'Point',
                    coordinates: [baseLng + randomLngOffset, baseLat + randomLatOffset] // [longitude, latitude]
                }
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

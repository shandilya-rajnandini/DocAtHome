const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // use app, not server
const User = require('../models/User');

beforeAll(async () => {
  const testDbUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI + '_test';
  await mongoose.connect(testDbUri);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('should create a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'test user',
        email: 'testUser@example.com',
        password: 'TestPassword123!', // strong password with uppercase, lowercase, number, special char
        role: 'patient',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register a user if email already exists', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'test user',
        email: 'duplicateUser@example.com',
        password: 'TestPassword123!',
        role: 'patient',
      });

    // Attempt to register again with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'test user2',
        email: 'duplicateUser@example.com',
        password: 'TestPassword123!',
        role: 'patient',
      });

    expect(res.statusCode).toBe(409); // correct status for duplicate email
    expect(res.body.message).toBe('User already exists'); // match backend response key
  });
});

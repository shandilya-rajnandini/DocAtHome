const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server'); // import server.js, not app
const User = require('../models/User');

// Connect to test database before running tests
beforeAll(async () => {
  const testDbUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI + '_test';
  await mongoose.connect(testDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up data after each test
afterEach(async () => {
  try {
    await User.deleteMany({});
  } catch (error) {
    console.error('Failed to clean up test data:', error);
  }
});

// Close DB and server after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close(); // stop Express server to prevent hanging in CI
  } catch (error) {
    console.error('❌ Failed to clean up test environment:', error);
  }
});

describe('POST /api/auth/register', () => {
  it('should create a new user and return a token', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        name: 'test user',
        email: 'testUser@example.com',
        password: 'testpassword123',
        role: 'patient',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');

    const user = await User.findOne({ email: 'testUser@example.com' });
    expect(user).not.toBeNull();
    expect(user.name).toBe('test user');
  });

  it('should not register a user if email already exists', async () => {
    // First registration
    await request(server)
      .post('/api/auth/register')
      .send({
        name: 'test user',
        email: 'duplicateUser@example.com',
        password: 'testpassword123',
        role: 'patient',
      });

    // Attempt to register again with same email
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        name: 'test user2',
        email: 'duplicateUser@example.com',
        password: 'testpassword456',
        role: 'patient',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('User already exists');
  });
});

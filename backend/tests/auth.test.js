const request = require("supertest");
const mongoose = require("mongoose");
const app = require('../app');   
const User = require('../models/User');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

afterEach( async () => {
    await User.deleteMany({});
})  

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
})


describe("POST /api/auth/register" , () => {
    it("should create a new user and return a token", async () => {
        const res = await request(app)
        .post("/api/auth/register")
        .send({
            name: "test user",
            email: "testUser@example.com",
            password: "testpassword123",
            role: "patient"
        })

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");

        const user = await User.findOne({ email: "testUser@example.com" });
        expect(user).not.toBeNull();
        expect(user.name).toBe("test user");
    })

    it("should not register a user if email already exists", async () => {

        //  First registration
        await request(app)
        .post("/api/auth/register")
        .send({
            name: "test user",
            email: "duplicateUser@example.com",
            password: "testpassword123",
            role: "patient"
        })

        //  Attempt to register again with same email
        const res = await request(app)
        .post("/api/auth/register")
        .send({
            name: "test user2",
            email: "duplicateUser@example.com",
            password: "testpassword456",
            role: "patient"
        })

        expect(res.statusCode).toBe(400)
        expect(res.body.msg).toBe("User already exists");
    })
})
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret12345';
process.env.PORT = 3001;

const request = require('supertest');
const app = require('../../app');
const dbSetup = require('../setup');
const User = require('../../models/user-model');
const tokenService = require('../../services/token-service');

beforeAll(async () => {
    await dbSetup.connectDB();
});

afterEach(async () => {
    await dbSetup.clearDB();
});

afterAll(async () => {
    await dbSetup.closeDB();
});

describe('User Listing Integration Tests', () => {
    let accessToken;
    let users = [];

    beforeEach(async () => {
        // Seed 15 Users
        for (let i = 0; i < 15; i++) {
            users.push({
                firstName: `Test${i}`,
                lastName: `User${i}`,
                email: `test${i}@example.com`,
                password: 'password123',
                role: 'USER'
            });
        }
        await User.insertMany(users);
        const adminUser = await User.findOne({ email: 'test0@example.com' });
        adminUser.role = 'ADMIN';
        await adminUser.save();

        accessToken = tokenService.generateAccessToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });
    });

    it('should paginate users correctly without cursor (initial page)', async () => {
        const res = await request(app)
            .get('/users?limit=10')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(10);
        expect(res.body.hasNextPage).toBe(true);
        expect(res.body.nextCursor).toBeTruthy();
    });

    it('should fetch next page using cursor', async () => {
        const initialRes = await request(app)
            .get('/users?limit=10')
            .set('Authorization', `Bearer ${accessToken}`);

        const nextCursor = initialRes.body.nextCursor;

        const nextRes = await request(app)
            .get(`/users?limit=10&cursor=${nextCursor}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(nextRes.statusCode).toBe(200);
        expect(nextRes.body.data.length).toBe(5); // 15 total - 10 first page = 5
        expect(nextRes.body.hasNextPage).toBe(false);
    });

    it('should block unauthorized access', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(401);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('Token is required');
    });

    it('should block bad tokens', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer badtoken`);
        expect(res.statusCode).toBe(401);
    });
});

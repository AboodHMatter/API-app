process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret12345';
process.env.JWT_REFRESH_SECRET = 'testrefreshsecret';
process.env.PORT = 3001;

const request = require('supertest');
const app = require('../../app');
const dbSetup = require('../setup');
const User = require('../../models/user-model');
const { SECURITY } = require('../../config/constants');

beforeAll(async () => {
    await dbSetup.connectDB();
});

afterEach(async () => {
    await dbSetup.clearDB();
});

afterAll(async () => {
    await dbSetup.closeDB();
});

describe('Auth Integration Tests', () => {
    const validUser = {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: 'password123',
        role: 'USER'
    };

    describe('POST /users/register', () => {
        it('should successfully register a user and return tokens', async () => {
            const res = await request(app).post('/users/register').send(validUser);
            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.accessToken).toBeDefined();

            // Check cookie
            const cookies = inCookies(res, SECURITY.REFRESH_COOKIE_NAME);
            expect(cookies).toBeTruthy();

            const userInDb = await User.findOne({ email: validUser.email });
            expect(userInDb).toBeTruthy();
            expect(userInDb.refreshTokens.length).toBe(1);
        });

        it('should fail with 400 if user exists', async () => {
            await request(app).post('/users/register').send(validUser);
            const res = await request(app).post('/users/register').send(validUser);
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });

        it('should fail due to validation errors', async () => {
            const res = await request(app).post('/users/register').send({ email: 'bad' });
            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
        });
    });

    describe('POST /users/login', () => {
        beforeEach(async () => {
            await request(app).post('/users/register').send(validUser);
        });

        it('should login and return tokens', async () => {
            const res = await request(app).post('/users/login').send({
                email: validUser.email,
                password: validUser.password
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.data.accessToken).toBeDefined();
            expect(inCookies(res, SECURITY.REFRESH_COOKIE_NAME)).toBeTruthy();
        });

        it('should reject invalid password', async () => {
            const res = await request(app).post('/users/login').send({
                email: validUser.email,
                password: 'wrong'
            });
            expect(res.statusCode).toBe(401);
            expect(res.body.status).toBe('fail');
        });
    });

    describe('POST /users/refresh-token & logout', () => {
        let refreshTokenCookie;

        beforeEach(async () => {
            const res = await request(app).post('/users/register').send(validUser);
            refreshTokenCookie = res.headers['set-cookie'][0];
        });

        it('should rotate token successfully', async () => {
            const res = await request(app)
                .post('/users/refresh-token')
                .set('Cookie', refreshTokenCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.accessToken).toBeDefined();
            const newCookies = inCookies(res, SECURITY.REFRESH_COOKIE_NAME);
            expect(newCookies).toBeTruthy();
        });

        it('should detect reuse attack and invalidate', async () => {
            // First rotation is fine
            const firstRes = await request(app)
                .post('/users/refresh-token')
                .set('Cookie', refreshTokenCookie);

            expect(firstRes.statusCode).toBe(200);

            // Reusing the OLD refresh token (which was just rotated)
            const attackRes = await request(app)
                .post('/users/refresh-token')
                .set('Cookie', refreshTokenCookie);

            expect(attackRes.statusCode).toBe(403);
            expect(attackRes.body.message).toMatch(/Security Alert/i);

            // DB should be cleared
            const dbUser = await User.findOne({ email: validUser.email });
            expect(dbUser.refreshTokens.length).toBe(0);
        });

        it('should logout and clear cookie', async () => {
            const res = await request(app)
                .post('/users/logout')
                .set('Cookie', refreshTokenCookie);

            expect(res.statusCode).toBe(200);
            const cookieHeader = res.headers['set-cookie'][0];
            expect(cookieHeader).toContain(`${SECURITY.REFRESH_COOKIE_NAME}=;`); // Cleared
        });
    });

    function inCookies(res, name) {
        if (!res.headers['set-cookie']) return false;
        return res.headers['set-cookie'].some(str => str.startsWith(`${name}=`));
    }
});

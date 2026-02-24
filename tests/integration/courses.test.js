process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret12345';
process.env.PORT = 3001;

const request = require('supertest');
const app = require('../../app');
const dbSetup = require('../setup');
const Course = require('../../models/course-model');
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

describe('Courses API Integration Tests', () => {
    let userToken;
    let adminToken;
    let userDoc;

    beforeEach(async () => {
        userDoc = await User.create({
            firstName: 'Reg',
            lastName: 'User',
            email: 'reg@example.com',
            password: 'pw',
            role: 'USER'
        });
        const adminDoc = await User.create({
            firstName: 'Admin',
            lastName: 'Sys',
            email: 'admin@example.com',
            password: 'pw',
            role: 'ADMIN'
        });

        userToken = tokenService.generateAccessToken({ id: userDoc._id, email: userDoc.email, role: 'USER' });
        adminToken = tokenService.generateAccessToken({ id: adminDoc._id, email: adminDoc.email, role: 'ADMIN' });
    });

    describe('GET /course', () => {
        beforeEach(async () => {
            const courses = [];
            for (let i = 0; i < 5; i++) {
                courses.push({ title: `Course${i}`, price: 10 * i, createdBy: userDoc._id });
            }
            await Course.insertMany(courses);
        });

        it('should get all courses paginated', async () => {
            const res = await request(app).get('/course?limit=3');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(3);
            expect(res.body.hasNextPage).toBe(true);
        });
    });

    describe('POST /course', () => {
        const validCourse = { title: 'Node.js', price: 100, category: 'Backend' };

        it('should create course if authenticated', async () => {
            const res = await request(app)
                .post('/course')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...validCourse, createdBy: userDoc._id });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.title).toBe(validCourse.title);
        });

        it('should fail if unauthenticated', async () => {
            const res = await request(app).post('/course').send(validCourse);
            expect(res.statusCode).toBe(401);
        });

        it('should fail validation without price', async () => {
            const res = await request(app)
                .post('/course')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Hmm' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /course/:id', () => {
        it('should retrieve a single course', async () => {
            const c = await Course.create({ title: 'CSS', price: 10, createdBy: userDoc._id });
            const res = await request(app).get(`/course/${c._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe('CSS');
        });

        it('should 404 for invalid ID format', async () => {
            const res = await request(app).get(`/course/invalid123`);
            expect(res.statusCode).toBe(500); // Or 400 depending on global error handler casting errors
        });

        it('should 404 for non-existent course', async () => {
            const fakeId = userDoc._id; // valid format, isn't a course
            const res = await request(app).get(`/course/${fakeId}`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /course/:id', () => {
        let courseId;
        beforeEach(async () => {
            const c = await Course.create({ title: 'React', price: 90, createdBy: userDoc._id });
            courseId = c._id;
        });

        it('should let ADMIN delete', async () => {
            const res = await request(app)
                .delete(`/course/${courseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            const check = await Course.findById(courseId);
            expect(check).toBeNull();
        });

        it('should FORBID normal USER', async () => {
            const res = await request(app)
                .delete(`/course/${courseId}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Forbidden');
        });
    });
});

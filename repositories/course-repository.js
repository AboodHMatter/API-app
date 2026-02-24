const Course = require('../models/course-model');

class CourseRepository {
    async findPaginated(cursor, limit) {
        const query = {};
        if (cursor) {
            query._id = { $lt: cursor };
        }

        const data = await Course.find(query, { __v: false })
            .sort({ _id: -1 })
            .limit(limit + 1); // Fetch one extra to check if there is a next page

        return data;
    }

    async findById(courseId) {
        return Course.findById(courseId);
    }

    async create(courseData) {
        return Course.create(courseData);
    }

    async deleteOne(query) {
        return Course.deleteOne(query);
    }
}

module.exports = new CourseRepository();

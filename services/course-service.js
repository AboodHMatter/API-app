const courseRepository = require('../repositories/course-repository');
const AppError = require('../utils/app-error');

const getAllCourses = async (cursor, limit) => {
    const records = await courseRepository.findPaginated(cursor, limit);

    let hasNextPage = false;
    let nextCursor = null;

    if (records.length > limit) {
        hasNextPage = true;
        records.pop(); // Remove the extra item
    }

    if (records.length > 0) {
        nextCursor = records[records.length - 1]._id.toString();
    }

    return {
        data: records,
        nextCursor,
        hasNextPage
    };
};

const createCourse = async (courseData) => {
    return courseRepository.create(courseData);
};

const getCourseById = async (courseId) => {
    const course = await courseRepository.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404, 'fail');
    }
    return course;
};

const deleteCourseById = async (courseId) => {
    const course = await courseRepository.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404, 'fail');
    }
    await courseRepository.deleteOne({ _id: courseId });
    return null;
};

module.exports = {
    getAllCourses,
    createCourse,
    getCourseById,
    deleteCourseById
};

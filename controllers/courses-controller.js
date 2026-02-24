const { validationResult } = require('express-validator');
const courseService = require("../services/course-service.js");
const asyncWrapper = require("./async-wrapper.js");
const AppError = require('../utils/app-error.js');

/**
 * @swagger
 * /course:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of courses to return
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (_id)
 *     responses:
 *       200:
 *         description: Successfully retrieved courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                 hasNextPage:
 *                   type: boolean
 */


const getAllCourses = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = Math.min(parseInt(query.limit) || 10, 50);
  const cursor = query.cursor || null;

  const result = await courseService.getAllCourses(cursor, limit);

  res.status(200).json({
    status: "success",
    data: result.data,
    nextCursor: result.nextCursor,
    hasNextPage: result.hasNextPage
  });
});

/**
 * @swagger
 * /course:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
const addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError(errors.array().map(err => err.msg).join(", "), 400, "fail");
    return next(error);
  }
  const newCourse = await courseService.createCourse({ ...req.body, createdBy: req.currentUser.id });
  res.status(201).json({ status: "success", data: newCourse });
});

/**
 * @swagger
 * /course/{courseId}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 */
const getCourseById = asyncWrapper(async (req, res, next) => {
  const course = await courseService.getCourseById(req.params.courseId);
  return res.status(200).json({ status: "success", data: course });
});

/**
 * @swagger
 * /course/{courseId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Course not found
 */
const deleteCourseById = asyncWrapper(async (req, res, next) => {
  await courseService.deleteCourseById(req.params.courseId);
  res.status(200).json({ status: "success", data: null });
});

module.exports = { getAllCourses, getCourseById, addCourse, deleteCourseById };
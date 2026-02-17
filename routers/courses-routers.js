// const express = require('express');
// const validation = require('./middleware/validation.js');

// const router = express.Router();
// let controllers = require("../controllers/courses-controller.js");

// router.route('/course/:courseId').get(controllers.getCourseById).delete(controllers.deleteCourseById);

// router.route('/course').post(validation(), controllers.addCourse).get(controllers.getAllCourses);

// module.exports = router;

const express = require("express");
const router = express.Router();
const controllers = require("../controllers/courses-controller.js");
const validation = require("./middleware/validation.js");
const verifyToken = require("./middleware/token-verification.js");
const { userRoles } = require("../utilty/user-roles.js");
const allowedTo = require("./middleware/allowedTo.js");

router.route("/course/:courseId").get(controllers.getCourseById).delete(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), controllers.deleteCourseById);
router.route("/course").get(controllers.getAllCourses).post(verifyToken, validation(), controllers.addCourse);

module.exports = router;
const express = require("express");
const router = express.Router();
const controllers = require("../controllers/courses-controller.js");
const { courseValidation } = require("../middleware/validation.js");
const verifyToken = require("../middleware/token-verification.js");
const { userRoles } = require("../utils/user-roles.js");
const allowedTo = require("../middleware/allowed-to.js");

router.route("/:courseId")
    .get(controllers.getCourseById)
    .delete(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), controllers.deleteCourseById);

router.route("/")
    .get(controllers.getAllCourses)
    .post(verifyToken, courseValidation(), controllers.addCourse);

module.exports = router;
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/token-verification.js");
const usersController = require("../controllers/users-controller.js");
const { firstNameValidation, lastNameValidation, emailValidation, passwordValidation } = require("../middleware/validation.js");
const AppError = require("../utils/app-error.js");
const upload = require("../middleware/upload.js");

router.route("/users")
  .get(verifyToken, usersController.getAllUsers);

router.route("/users/register")
  .post(upload.single("avatar"), firstNameValidation(), lastNameValidation(), emailValidation(), passwordValidation(), usersController.register);

router.route("/users/login")
  .post(emailValidation(), passwordValidation(), usersController.login);

router.route("/users/refresh-token")
  .post(usersController.refreshToken);

router.route("/users/logout")
  .post(usersController.logout);

router.route("/users/avatar")
  .patch(verifyToken, upload.single("avatar"), usersController.updateAvatar);

module.exports = router;
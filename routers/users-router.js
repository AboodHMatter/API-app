const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/token-verification.js");
const usersController = require("../controllers/users-controller.js");
const { firstNameValidation, lastNameValidation, emailValidation, passwordValidation } = require("../middleware/validation.js");
const AppError = require("../utils/app-error.js");
const upload = require("../middleware/upload.js");

router.route("/")
  .get(verifyToken, usersController.getAllUsers);

router.route("/register")
  .post(upload.single("avatar"), firstNameValidation(), lastNameValidation(), emailValidation(), passwordValidation(), usersController.register);

router.route("/login")
  .post(emailValidation(), passwordValidation(), usersController.login);

router.route("/refresh-token")
  .post(usersController.refreshToken);

router.route("/logout")
  .post(usersController.logout);

router.route("/avatar")
  .patch(verifyToken, upload.single("avatar"), usersController.updateAvatar);

module.exports = router;
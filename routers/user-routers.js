const express = require("express");
const router = express.Router();
const verifyToken = require("./middleware/token-verification.js");
const usersController = require("../controllers/usersController.js");
const appErorr = require("../utilty/appError.js");
const multer = require("multer");
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new appErorr("Only image files are allowed", 400), false);
  }
};
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("File received:", file);
    cb(null /*error*/, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
    console.log("File received:", file);

  }
});
const upload = multer({ storage: diskStorage,
    fileFilter
 });
router.route("/users")
.get(verifyToken, usersController.getAllUsers);
router.route("/users/register")
.post(upload.single("avatar"), usersController.register);
router.route("/users/login")
.post(usersController.login);

module.exports = router;
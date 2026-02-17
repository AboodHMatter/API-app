const asyncWrapper = require("./asyncWrabber.js");
const appErorr = require('../utilty/appError.js');
const user = require("../models/user-model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const generateJWT = require("../utilty/generate_JWT.js");
dotenv.config();
let getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;
  const users = await user.find({}, { __v: false, password: false }).limit(limit).skip(skip);
  res.status(200).json({ status: "success", data: users }).end();
})

let register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  console.log(req.file);

  // Check if user already exists
  const oldUser = await user.findOne({ email: email });
  if (oldUser) {
    const error = appErorr.create("User already exists", 400, "fail");
    return next(error);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save new user
  const newUser = new user({ firstName, lastName, email, password: hashedPassword, role, avatar: req.file ? req.file.filename : undefined });

  const token = await generateJWT({ id: newUser._id, email: newUser.email, role: newUser.role });


  newUser.token = token;
  newUser.save().then(() => {
    res.status(201).json({ status: "success", data: newUser }).end();
  }).catch((err) => {
    const error = appErorr.create(err.message, 500, "fail");
    return next(error);
  });
});


const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = appErorr.create("Email and password are required", 400, "fail");
    return next(error);
  }

  const foundUser = await user.findOne({ email: email });

  if (!foundUser) {
    const error = appErorr.create("Invalid email or password", 401, "fail");
    return next(error);
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    const error = appErorr.create("Invalid email or password", 401, "fail");
    return next(error);
  }

  const token = await generateJWT({ id: foundUser._id, email: foundUser.email, role: foundUser.role });
  res.status(200).json({ status: "success", data: { token } });
})

module.exports = { getAllUsers, register, login };
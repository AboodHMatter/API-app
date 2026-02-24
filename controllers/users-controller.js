const authService = require('../services/auth-service');
const userService = require('../services/user-service');
const asyncWrapperMiddleware = require('./async-wrapper');
const { successResponse } = require('../utils/response-formatter');
const AppError = require('../utils/app-error');
const { PAGINATION, COOKIE_OPTIONS, SECURITY } = require('../config/constants');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users to return
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (_id)
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       401:
 *         description: Unauthorized
 */
const getAllUsers = asyncWrapperMiddleware(async (req, res, next) => {
  const query = req.query;
  const limit = parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT;
  const cursor = query.cursor || null;

  const result = await userService.getAllUsers(cursor, limit);

  // Explicitly destructure per requirement and to avoid double nesting
  return res.status(200).json({
    status: "success",
    data: result.data,
    nextCursor: result.nextCursor,
    hasNextPage: result.hasNextPage
  });
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abcde12345; HttpOnly; Secure
 *       400:
 *         description: Bad request or User already exists
 */
const register = asyncWrapperMiddleware(async (req, res, next) => {
  const { accessToken, refreshToken, user } = await authService.registerUser(req.body, req.file);

  res.cookie(SECURITY.REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

  // Convert Mongoose doc to JSON to apply the transform (remove password)
  const userData = user.toJSON ? user.toJSON() : user;

  return successResponse(res, { user: userData, accessToken }, 'User registered successfully', 201);
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abcde12345; HttpOnly; Secure
 *       401:
 *         description: Invalid email or password
 */
const login = asyncWrapperMiddleware(async (req, res, next) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

  res.cookie(SECURITY.REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

  const userData = user.toJSON ? user.toJSON() : user;

  return successResponse(res, { user: userData, accessToken }, 'Logged in successfully');
});

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Refresh token required or invalid
 *       403:
 *         description: Token reuse detected or token expired
 */
const refreshToken = asyncWrapperMiddleware(async (req, res, next) => {
  const incomingRefreshToken = req.cookies[SECURITY.REFRESH_COOKIE_NAME];

  const result = await authService.refreshToken(incomingRefreshToken);

  res.cookie(SECURITY.REFRESH_COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

  return successResponse(res, { accessToken: result.accessToken }, 'Token refreshed successfully');
});

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
const logout = asyncWrapperMiddleware(async (req, res, next) => {
  const incomingRefreshToken = req.cookies[SECURITY.REFRESH_COOKIE_NAME];

  await authService.logoutUser(incomingRefreshToken);

  res.clearCookie(SECURITY.REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite
  });

  return successResponse(res, null, 'Logged out successfully');
});

/**
 * @swagger
 * /users/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: No image provided
 *       401:
 *         description: Unauthorized
 */
const updateAvatar = asyncWrapperMiddleware(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide an image', 400, 'fail'));
  }

  const updatedUser = await userService.updateAvatar(req.currentUser.id, req.file.buffer);

  const userData = updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;

  return successResponse(res, { user: userData }, 'Avatar updated successfully', 200);
});

module.exports = {
  getAllUsers,
  register,
  login,
  refreshToken,
  logout,
  updateAvatar
};
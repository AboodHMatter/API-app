const userRepository = require('../repositories/user-repository');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const AppError = require('../utils/app-error');
const cloudinaryService = require('./cloudinary-service');
const { SECURITY } = require('../config/constants');

const buildAuthResponse = async (user) => {
    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = tokenService.generateAccessToken(payload);
    const refreshToken = tokenService.generateRefreshToken({ id: user._id }); // Minimal payload

    // Hash the active refresh token and save to DB
    const hashedRT = tokenService.hashToken(refreshToken);

    // We can keep an array of active tokens for multiple devices
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(hashedRT);
    await user.save();

    return { accessToken, refreshToken, user };
};

const registerUser = async (userData, file) => {
    const { firstName, lastName, email, password } = userData;
    const existingUser = await userRepository.findOne({ email });

    if (existingUser) {
        throw new AppError('User already exists', 400, 'fail');
    }

    const hashedPassword = await bcrypt.hash(password, SECURITY.SALT_ROUNDS);

    let avatarUrl = undefined;
    let avatarPublicId = undefined;

    if (file && file.buffer) {
        const uploadResult = await cloudinaryService.uploadImage(file.buffer);
        avatarUrl = uploadResult.secure_url;
        avatarPublicId = uploadResult.public_id;
    }

    const newUser = await userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatarUrl,
        avatarPublicId,
        refreshTokens: []
    });

    return buildAuthResponse(newUser);
};

const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'fail');
    }

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
        throw new AppError('Invalid email or password', 401, 'fail');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'fail');
    }

    return buildAuthResponse(user);
};

const refreshToken = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new AppError('Refresh token required', 401, 'fail');
    }

    let decodedPayload;
    try {
        decodedPayload = tokenService.verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
        throw new AppError('Invalid or expired refresh token', 403, 'fail');
    }

    const hashedIncomingRT = tokenService.hashToken(incomingRefreshToken);
    const user = await userRepository.findById(decodedPayload.id);

    if (!user) {
        throw new AppError('User not found', 401, 'fail');
    }

    // Token Reuse Detection
    if (!user.refreshTokens.includes(hashedIncomingRT)) {
        // A valid token was presented, but it's NOT in the active list!
        // This signifies that an already-used (or revoked) token was leaked and reused.
        // We MUST invalidate the entire family to protect the user.
        user.refreshTokens = [];
        await user.save();
        throw new AppError('Security Alert: Token reuse detected. You have been logged out of all devices.', 403, 'fail');
    }

    // Token rotation: Remove the USED token from the array
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== hashedIncomingRT);

    // Generate new family
    const payload = { id: user._id, email: user.email, role: user.role };
    const newAccessToken = tokenService.generateAccessToken(payload);
    const newRefreshToken = tokenService.generateRefreshToken({ id: user._id });
    const newHashedRT = tokenService.hashToken(newRefreshToken);

    user.refreshTokens.push(newHashedRT);
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) return;

    const hashedRT = tokenService.hashToken(incomingRefreshToken);

    // Attempt to decode to find the user directly to avoid global search
    let decoded;
    try {
        decoded = tokenService.decodeToken(incomingRefreshToken);
    } catch (err) {
        return;
    }

    if (decoded && decoded.id) {
        const user = await userRepository.findById(decoded.id);
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(rt => rt !== hashedRT);
            await user.save();
        }
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
};

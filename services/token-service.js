const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const { SECURITY } = require('../config/constants');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: SECURITY.JWT_EXPIRES_IN });
};

const generateRefreshToken = (payload) => {
    // We use a separate secret and expiration for the refresh token
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: SECURITY.JWT_REFRESH_EXPIRES_IN });
};

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken
};

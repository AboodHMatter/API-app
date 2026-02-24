const jwt = require("jsonwebtoken");
const AppError = require("../utils/app-error.js");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        const error = new AppError("Token is required", 401, "fail");
        return next(error);
    }
    if (!authHeader.startsWith('Bearer ')) {
        const error = new AppError("Invalid token format", 401, "fail");
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    try {
        const currentUser = jwt.verify(token, process.env.JWT_SECRET);
        req.currentUser = currentUser;
        next();
    } catch (err) {
        const error = new AppError("Invalid token", 401, "fail");
        return next(error);
    }
};

module.exports = verifyToken;
const jwt = require("jsonwebtoken");
const appErorr = require("../../utilty/appError.js");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']|| req.headers['Authorization'];
    if (!authHeader ) {
        const error = appErorr.create("Token is required", 401, "fail");
        return next(error);    }
    if (!authHeader.startsWith('Bearer ')) {
        const error = appErorr.create("Invalid token format", 401, "fail");
        return next(error);
    }
    const token =authHeader.split(' ')[1];
    try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET);
    req.currentUser = currentUser;
        next();
    } catch (err) {
        const error = appErorr.create("Invalid token", 401, "fail");
        return next(error);
    }

}
module.exports = verifyToken;
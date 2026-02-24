const AppError = require("../utils/app-error.js");

module.exports = (...roles) => {
    return (req, res, next) => {
        if (!req.currentUser) {
            const error = new AppError("Unauthorized", 401, "fail");
            return next(error);
        }

        if (!roles.includes(req.currentUser.role)) {
            const error = new AppError("Forbidden", 403, "fail");
            return next(error);
        }

        next();
    };
};

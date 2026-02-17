const appErorr = require("../../utilty/appError.js");
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.currentUser) {
      const error = appErorr.create("Unauthorized", 401, "fail");
      return next(error);
    }

    if (!roles.includes(req.currentUser.role)) {
      const error = appErorr.create("Forbidden", 403, "fail");
      return next(error);
    }

    next();
  };
};
class AppError extends Error {
    constructor(message, statusCode, statusText) {
        super(message);
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.isOperational = true;

    }
}

module.exports = AppError;

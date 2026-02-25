require('dotenv').config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/v1", limiter);

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

const coursesRouter = require("./routers/courses-router.js");
const usersRouter = require("./routers/users-router.js");

app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/users", usersRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
});
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API" });
});

app.all(/(.*)/, (req, res) => {
    res.status(404).json({ status: "fail", message: "Route not found" });
});

app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        err.statusCode = 400;
        err.statusText = "fail";
        err.message = Object.values(err.errors)
            .map(val => val.message)
            .join(', ');
    }

    res.status(err.statusCode || 500).json({
        status: err.statusText || "error",
        message: err.message,
    });
});

module.exports = app;